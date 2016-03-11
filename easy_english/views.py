import logging
import datetime
from django.contrib.auth.models import AnonymousUser
from django.http import HttpResponse
from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.generics import (ListCreateAPIView, ListAPIView,
    CreateAPIView)
from rest_framework.response import Response
from easy_english.serializers import (TranslatorResultSerializer,
    SubtitleSerializer, NewUserSerializer, AuthTokenSerializer,
    SubtitleListSerializer, UserForeignWordSerializer,
    UserForeignWordListSerializer, SubtitleWordListSerializer)
from easy_english.services.auth import ExpiringTokenAuthentication
from easy_english.services.file_exporters import UserWordsToCsvFileWriter
from easy_english.services.subtitle.base import get_split_subtitles
from easy_english.services.translator.base import get_translation
from easy_english.services.user_dict import UserDictionary

logger = logging.getLogger(__name__)

JSON_CONTENT_TYPE = 'application/json'


def is_user_authorized_inside_request(request):
    return hasattr(request, 'user') and not isinstance(request.user,
                                                       AnonymousUser)


def check_authorized_user_inside_request(request):
    if not is_user_authorized_inside_request(request):
        return Response(status=status.HTTP_401_UNAUTHORIZED)


class IndexView(TemplateView):
    template_name = 'index.html'


class ObtainExpiringAuthToken(ObtainAuthToken):
    serializer_class = AuthTokenSerializer

    def post(self, request, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(
                user=user)

            if not created:
                # update the created time of the token to keep it valid
                token.created = datetime.datetime.utcnow()
                token.save()

            return Response({'token': token.key, 'username': user.username})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


obtain_expiring_auth_token = ObtainExpiringAuthToken.as_view()


class SignInUser(CreateAPIView):
    serializer_class = NewUserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'username': user.username})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogOutUser(CreateAPIView):
    authentication_classes = (ExpiringTokenAuthentication,)

    def post(self, request, *args, **kwargs):
        if request.user and hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        return Response(status=status.HTTP_200_OK)


class SubtitleListView(ListCreateAPIView):
    authentication_classes = (ExpiringTokenAuthentication,)

    def post(self, request, *args, **kwargs):
        if request.FILES and len(request.FILES):
            try:
                subtitles = get_split_subtitles(request.FILES['file'])
                ser_subtitles = SubtitleListSerializer(subtitles)
                return Response(
                    data=ser_subtitles.data,
                    content_type=JSON_CONTENT_TYPE,
                    status=status.HTTP_200_OK
                )
            except Exception as ex:
                logger.exception(ex)
                return Response(
                    status=status.HTTP_406_NOT_ACCEPTABLE,
                    data={'message': ex.args[0]}
                )
        else:
            logger.error(
                'Subtitles were not handled. Must be file format is not supported.')
            return Response(status=status.HTTP_400_BAD_REQUEST)


class TranslatorView(ListAPIView):
    authentication_classes = (ExpiringTokenAuthentication,)

    def get(self, request, *args, **kwargs):
        if not request.query_params or not request.query_params.get('action'):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        action = request.query_params.get('action', None)
        if action == 'translate':
            try:
                source = request.query_params.get('source', '')
                translation = get_translation(source)
                if is_user_authorized_inside_request(request):
                    user_dict = UserDictionary(request.user)
                    translation = user_dict.mark_exist_translations(translation)
                ser_translation = TranslatorResultSerializer(translation)
                return Response(
                    data=ser_translation.data,
                    content_type=JSON_CONTENT_TYPE,
                    status=status.HTTP_200_OK
                )
            except Exception as ex:
                logger.exception(ex)
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class UserDictionaryView(ListCreateAPIView):
    authentication_classes = (ExpiringTokenAuthentication,)
    ACTUAL_WORDS = 'actual'
    LEARNED_WORDS = 'learned'
    ACTION_DELETE = 'delete'
    ACTION_SEND_TO_LEARNED = 'send_to_learned'
    ACTION_ADD_TO_LEARNED = 'add_word_to_learned'
    ACTION_DEL_FROM_LEARNED = 'del_word_from_learned'
    ACTION_ANKI_EXPORT = 'anki_export'
    ACTION_MARK_WORDS_EXPORTED = 'mark_exported'
    ACTION_MARK_WORDS_STATUS = 'mark_words_status'

    def get(self, request, *args, **kwargs):
        check_authorized_user_inside_request(request)
        user_dict = UserDictionary(request.user)
        if request.query_params:
            type_words = request.query_params.get('type_words', None)
            page_num = int(request.query_params.get('target_page', 1))
            items_per_page = int(request.query_params.get('items_per_page', 15))
            if type_words == self.ACTUAL_WORDS:
                total_count, words = user_dict.get_actual_words(page_num,
                                                                items_per_page)
                serializer = UserForeignWordListSerializer(data={
                    'total_count': total_count,
                    'foreign_words': words
                })
                if serializer.is_valid(raise_exception=True):
                    return Response(data=serializer.data,
                                    status=status.HTTP_200_OK)
            if type_words == self.LEARNED_WORDS:
                total_count, words = user_dict.get_learned_words(page_num,
                                                                 items_per_page)
                serializer = UserForeignWordListSerializer(data={
                    'total_count': total_count,
                    'foreign_words': words
                })
                if serializer.is_valid(raise_exception=True):
                    return Response(data=serializer.data,
                                    status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, *args, **kwargs):
        check_authorized_user_inside_request(request)
        try:
            if request.query_params:
                action = request.query_params.get('action', None)
                user_dict = UserDictionary(request.user)
                if action == self.ACTION_DELETE:
                    user_dict.delete_word_by_id(request.data.get('word_id'))
                    return Response(status=status.HTTP_200_OK)
                elif action == self.ACTION_SEND_TO_LEARNED:
                    value = True if request.query_params.get(
                        'value') == 'true' else False
                    user_dict.mark_word_is_learned(request.data.get('word_id'),
                                                   value)
                    return Response(status=status.HTTP_200_OK)
                elif action == self.ACTION_ADD_TO_LEARNED:
                    user_dict.add_word_to_learned(request.data.get('word_name'))
                    return Response(status=status.HTTP_200_OK)
                elif action == self.ACTION_DEL_FROM_LEARNED:
                    user_dict.del_word_from_learned(request.data.get('word_name'))
                    return Response(status=status.HTTP_200_OK)
                elif action == self.ACTION_ANKI_EXPORT:
                    words_id_list = request.data.get('exported_ids', None)
                    if words_id_list:
                        return self._get_export_words_to_anki_response(
                            request.user, words_id_list)
                elif action == self.ACTION_MARK_WORDS_EXPORTED:
                    words_id_list = request.data.get('exported_ids', None)
                    if words_id_list:
                        user_dict = UserDictionary(request.user)
                        user_dict.mark_actual_words_exported(words_id_list)
                        return Response(status=status.HTTP_200_OK)
                elif action == self.ACTION_MARK_WORDS_STATUS:
                    word_list = request.data.get('words', None)
                    if word_list:
                        user_dict = UserDictionary(request.user)
                        serializer = SubtitleWordListSerializer(data=word_list)
                        if serializer.is_valid(raise_exception=True):
                            word_list = serializer.data
                            marked_words = user_dict.mark_words_status(word_list)
                            serializer = SubtitleWordListSerializer(marked_words)
                            return Response(
                                data=serializer.data,
                                status=status.HTTP_200_OK
                            )
                return Response(status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = UserForeignWordSerializer(data=request.data)
                if serializer.is_valid(raise_exception=True):
                    serializer.save(user=request.user)
                    return Response(status=status.HTTP_200_OK)
                return Response(status=status.HTTP_400_BAD_REQUEST)
        except Exception as ex:
            logger.exception(ex)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    def _get_export_words_to_anki_response(self, user, words_id_list):
        response = HttpResponse(content_type='text/csv', charset='utf-8')
        response[
            'Content-Disposition'] = 'attachment; filename="anki_export.csv"'
        writer = UserWordsToCsvFileWriter(response)
        user_dict = UserDictionary(user)
        words = user_dict.get_actual_words_by_id_list(words_id_list)
        writer.write_user_word_list(words)
        return response


def download_anki_backup(request):
    from django.contrib.staticfiles import finders
    result = finders.find('resources/anki_backup.apkg')
    fsock = open(result, 'rb')
    response = HttpResponse(fsock, content_type='binary/octet-stream')
    response['Content-Disposition'] = "attachment; filename=backup-0.apkg"
    return response
