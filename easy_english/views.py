import logging

import datetime
from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.generics import (ListCreateAPIView, ListAPIView,
    CreateAPIView)
from rest_framework.response import Response
from easy_english.serializers import (TranslatorResultSerializer,
    SubtitleSerializer, NewUserSerializer, AuthTokenSerializer,
    SubtitleListSerializer)
from easy_english.services.auth import ExpiringTokenAuthentication
from easy_english.services.subtitle.base import get_split_subtitles
from easy_english.services.translator.base import get_translation

logger = logging.getLogger(__name__)

JSON_CONTENT_TYPE = 'application/json'


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
                return Response(status=status.HTTP_406_NOT_ACCEPTABLE)
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
