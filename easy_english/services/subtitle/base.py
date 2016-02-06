# -*- coding: utf-8 -*-
from json import JSONEncoder

import os

from easy_english.services.subtitle.splitters import SrtSubtitlesSplitter


class Subtitle(JSONEncoder):
    id = 0
    code = ''
    start = float()
    end = float()
    quote = ''

    def default(self, o):
        return {
            'id': o.id,
            'code': o.code,
            'start': o.start,
            'end': o.end,
            'quote': o.quote
        }


def get_split_subtitles(uploaded_file):
    file_ext = uploaded_file.name.split(os.extsep)[-1]
    if file_ext.upper() == 'SRT':
        splitter = SrtSubtitlesSplitter(uploaded_file)
    else:
        raise IOError('File extension \'%s\' is not supported.' % file_ext)
    return splitter.get_split_subtitles()