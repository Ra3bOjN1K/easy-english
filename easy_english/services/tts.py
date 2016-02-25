# -*- coding: utf-8 -*-
import errno
import os

from app import settings


class PronunciationLoader:
    pronunciations_dir = os.path.join(settings.MEDIA_ROOT, 'pron')

    def __init__(self):
        self.create_upload_dir_if_not_exists()

    def create_upload_dir_if_not_exists(self):
        if not os.path.exists(os.path.dirname(self.pronunciations_dir)):
            try:
                os.makedirs(os.path.dirname(self.pronunciations_dir))
            except OSError as exc:
                if exc.errno != errno.EEXIST:
                    raise

    # def download_pronunciation(self, word, file_name):
    #     tts = gTTS()
