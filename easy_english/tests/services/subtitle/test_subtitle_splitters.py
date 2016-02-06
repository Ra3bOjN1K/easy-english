# -*- coding: utf-8 -*-
import os
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from easy_english.services.subtitle.splitters import SrtSubtitlesSplitter

TESTS_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class SrtSubtitlesSplitterTestCase(TestCase):
    SUBTITLES_FILE_UTF8_PATH = os.path.join(
        TESTS_DIR, '../resources', 'srt_subtitles_utf-8.srt')
    SUBTITLES_FILE_UTF8_BOM_PATH = os.path.join(
        TESTS_DIR, '../resources', 'srt_subtitles_utf-8-bom.srt')
    SUBTITLES_FILE_WIN1251_PATH = os.path.join(
        TESTS_DIR, '../resources', 'srt_subtitles_win1251.srt')

    def _build_uploaded_file(self, file_path):
        content = open(file_path, 'rb').read()
        file_name = file_path.split(os.sep)[-1]
        return SimpleUploadedFile(name=file_name, content=content)

    def test_get_split_subtitles_successfully(self):
        file = self._build_uploaded_file(self.SUBTITLES_FILE_UTF8_PATH)
        subtitles = SrtSubtitlesSplitter(file).get_split_subtitles()
        self.assertEqual(10, len(subtitles))

    def test_get_split_subtitles_utf8_bom_successfully(self):
        file = self._build_uploaded_file(self.SUBTITLES_FILE_UTF8_BOM_PATH)
        subtitles = SrtSubtitlesSplitter(file).get_split_subtitles()
        self.assertEqual(10, len(subtitles))

    def test_get_split_subtitles_win1251_successfully(self):
        file = self._build_uploaded_file(self.SUBTITLES_FILE_WIN1251_PATH)
        subtitles = SrtSubtitlesSplitter(file).get_split_subtitles()
        self.assertEqual(19, len(subtitles))
