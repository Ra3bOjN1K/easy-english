import logging

from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, ListAPIView
from rest_framework.response import Response
from easy_english.serializers import (TranslatorResultSerializer,
    SubtitleSerializer)
from easy_english.services.subtitle.base import get_split_subtitles
from easy_english.services.translator.base import get_translation

logger = logging.getLogger(__name__)

JSON_CONTENT_TYPE = 'application/json'


class IndexView(TemplateView):
    template_name = 'index.html'


class SubtitleListView(ListCreateAPIView):
    def post(self, request, *args, **kwargs):
        if request.FILES and len(request.FILES):
            try:
                logger.info('Handle subtitles \'%s\'' % request.FILES['file'].name)
                subtitles = get_split_subtitles(request.FILES['file'])
                ser_subtitles = [SubtitleSerializer(x).data for x in subtitles]
                return Response(
                    data=ser_subtitles,
                    content_type=JSON_CONTENT_TYPE,
                    status=status.HTTP_200_OK
                )
            except Exception as ex:
                logger.exception(ex)
                return Response(status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            logger.error('Subtitles were not handled. Must be file format was not supported.')
            return Response(status=status.HTTP_400_BAD_REQUEST)


class TranslatorView(ListAPIView):
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
