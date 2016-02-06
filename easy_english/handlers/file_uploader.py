# -*- coding: utf-8 -*-
from django.core.files.uploadhandler import MemoryFileUploadHandler, StopUpload

from app import settings


class RestrictedMemoryFileUploadHandler(MemoryFileUploadHandler):
    def receive_data_chunk(self, raw_data, start):
        if start > settings.MAX_FILE_UPLOAD_SIZE:
            raise StopUpload(connection_reset=True)
        return super(RestrictedMemoryFileUploadHandler,
                     self).receive_data_chunk(raw_data, start)

    def file_complete(self, file_size):
        return super(RestrictedMemoryFileUploadHandler, self).file_complete(
            file_size)
