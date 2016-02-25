# -*- coding: utf-8 -*-
import errno
import os
import re
from gtts import gTTS

from app import settings


class PronunciationLoader:
    pronunciations_dir = os.path.join(settings.MEDIA_ROOT, 'pron')

    def __init__(self):
        self.create_upload_dir_if_not_exists()

    def create_upload_dir_if_not_exists(self):
        if not os.path.exists(self.pronunciations_dir):
            try:
                os.makedirs(self.pronunciations_dir)
            except OSError as exc:
                if exc.errno != errno.EEXIST:
                    raise

    def download_pronunciation(self, word, file_name):
        file_path = self._file_full_path(file_name)
        if not self.file_exists(file_name):
            tts = gTTS(text=word, lang='en')
            f = open(file_path, 'wb+')
            tts.write_to_fp(f)
            f.close()
        m = re.search('/.+(/media/.+)', file_path)
        url_path = ''
        if m:
            url_path = m.group(1)
        return url_path

    def _file_full_path(self, file_name):
        file_name = file_name if file_name.endswith('.mp3') else file_name + '.mp3'
        return os.path.join(self.pronunciations_dir, file_name)

    def file_exists(self, file_name):
        return os.path.isfile(self._file_full_path(file_name))
