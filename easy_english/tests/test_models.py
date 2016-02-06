# -*- coding: utf-8 -*-

from django.test import TestCase

from easy_english.models import ForeignWord
from easy_english.services.translator.base import StructTypes, Lang


class ForeignWordTestCase(TestCase):
    def test_foreign_word_create_successfully(self):
        foreign_word = ForeignWord()
        foreign_word.title = 'appropriate'
        foreign_word.type = StructTypes.unknown.value
        foreign_word.language = Lang.english.value
        foreign_word.save()

        foreign_word = ForeignWord.objects.get(id=1)
        self.assertEqual('appropriate', foreign_word.title,
                         'Foreign word title != appropriate')
