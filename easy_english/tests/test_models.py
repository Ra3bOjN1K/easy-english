# -*- coding: utf-8 -*-

from django.test import TestCase

from easy_english.models import ForeignWord


class ForeignWordTestCase(TestCase):
    def test_foreign_word_create_successfully(self):
        foreign_word = ForeignWord()
        foreign_word.title = 'appropriate'
        foreign_word.type = ForeignWord.TYPE_UNKNOWN
        foreign_word.language = ForeignWord.LANG_ENGLISH
        foreign_word.save()

        foreign_word = ForeignWord.objects.get(id=1)
        self.assertEqual('appropriate', foreign_word.title,
                         'Foreign word title != appropriate')
