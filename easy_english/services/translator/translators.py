# -*- coding: utf-8 -*-
import json

import requests


class LinguaLeoTranslator:
    TRANSLATES_API_URL = 'http://api.lingualeo.com/gettranslates'
    ENCODING = 'utf-8'

    def _convert_to_result(self, content, orig_word):
        from easy_english.services.translator.base import Result, TranslationItem
        c = json.loads(content)

        def _prepare_translation(translation_content):
            return TranslationItem(
                word=translation_content.get('value'),
                pictures=[translation_content.get('pic_url')],
                votes=int(translation_content.get('votes'))
            )

        if c.get('error_code', None):
            res = Result.get_empty_result()
            res.word = c.get('error_msg')
            return res

        return Result(
            word=orig_word,
            transcription=c.get('transcription'),
            pronunciations=[c.get('sound_url', [])],
            pictures=[c.get('pic_url')],
            translations=[_prepare_translation(x) for x in c.get('translate')]
        )

    def translate(self, word):
        resp = requests.get(self.TRANSLATES_API_URL, {'word': word})
        if resp.ok:
            content = resp.content.decode(self.ENCODING)
            return self._convert_to_result(content, word)
        else:
            raise ValueError(
                'An error occurred while translating. %s' % resp.reason)
