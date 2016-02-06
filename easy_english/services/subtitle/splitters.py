# -*- coding: utf-8 -*-

from django.core.files.uploadedfile import UploadedFile
from easy_english.utils.time_handler import time_str_to_seconds


class SrtSubtitlesSplitter:
    SUBTITLE_TIME_PATTERN = '(\d{1,2}):(\d{1,2}):(\d{1,2}),(\d{1,3})'

    _uploaded_file = None
    _file_encoding = 'utf-8'
    _file_content = ''
    subtitle_list = []

    def __init__(self, uploaded_file):
        from easy_english.utils.file_handler import get_file_encoding

        self._uploaded_file = uploaded_file
        self._file_encoding = get_file_encoding(self._uploaded_file)
        self._file_content = self._get_file_content().replace("\r", "")
        self._new_subtitle_id = 0

    def _get_file_content(self):
        content = []
        if not isinstance(self._uploaded_file, UploadedFile):
            raise IOError(
                "File type \'%s\' is unavailable." % type(self._uploaded_file))
        for chunk in self._uploaded_file.chunks():
            content.append(chunk.decode(encoding=self._file_encoding))
        self._uploaded_file.close()
        return ''.join(content)

    def get_split_subtitles(self):
        content_blocks = self._divide_file_content_into_blocks()
        self.subtitle_list = []
        for block in content_blocks:
            self.subtitle_list.append(self._to_subtitle(block))
        return self.subtitle_list

    def _divide_file_content_into_blocks(self):
        quote_blocks = self._file_content.split("\n\n")
        return quote_blocks

    def _get_new_subtitle_id(self):
        self._new_subtitle_id += 1
        return self._new_subtitle_id

    def _to_subtitle(self, content_block):
        from easy_english.services.subtitle.base import Subtitle
        subtitle = Subtitle()
        subtitle.id = self._get_new_subtitle_id()
        quote_lines = []
        for idx, item in enumerate(content_block.split('\n')):
            if idx == 0:
                subtitle.code = item
            elif idx == 1:
                date_rows = item.split(' --> ')
                subtitle.start = time_str_to_seconds(
                    date_rows[0], self.SUBTITLE_TIME_PATTERN)
                subtitle.end = time_str_to_seconds(
                    date_rows[1], self.SUBTITLE_TIME_PATTERN)
            else:
                quote_lines.append(item)
        subtitle.quote = '<br>'.join(quote_lines)
        return subtitle
