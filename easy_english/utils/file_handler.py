# -*- coding: utf-8 -*-

from chardet.universaldetector import UniversalDetector
from django.core.files.uploadedfile import UploadedFile


def get_file_encoding(uploaded_file, should_close=False) -> (UploadedFile, bool):
    detector = UniversalDetector()
    bio = uploaded_file.file
    for line in bio.readlines():
        detector.feed(line)
        if detector.done:
            break
    detector.close()
    if should_close:
        uploaded_file.close()
    return detector.result.get('encoding')
