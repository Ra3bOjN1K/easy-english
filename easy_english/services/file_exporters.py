# -*- coding: utf-8 -*-
import csv

from csv import DictWriter

from app import settings

ANKI_DIALECT = 'anki'

csv.register_dialect(ANKI_DIALECT, delimiter=';')


class UserWordsToCsvFileWriter(DictWriter):
    HOST_NAME = settings.SERVER_NAME
    FIELD_ID = 'id'
    FIELD_IN_ENGLISH = 'in_english'
    FIELD_IN_RUSSIAN = 'in_russian'
    FIELD_CONTEXT = 'context'
    FIELD_PIC = 'picture'
    FIELD_SOUND = 'sound'
    FIELD_HAS_REVERSE_SIDE = 'has_reverse_side'

    def __init__(self, file):
        fieldnames = [self.FIELD_ID, self.FIELD_IN_ENGLISH,
                      self.FIELD_IN_RUSSIAN, self.FIELD_CONTEXT, self.FIELD_PIC,
                      self.FIELD_SOUND, self.FIELD_HAS_REVERSE_SIDE]
        super().__init__(file, fieldnames, dialect=ANKI_DIALECT)

    def write_user_word_list(self, words):
        self.writerows([self._user_word_to_dict(w) for w in words])

    def write_user_word(self, word):
        self.writerow(self._user_word_to_dict(word))

    def _user_word_to_dict(self, word):
        pron = word.ufw_prons.first()
        pron_path = ''
        if pron:
            pron_path = '%s%s' % (self.HOST_NAME, pron.name)

        return {
            self.FIELD_ID: '{0}_{1}'.format(
                word.created.strftime('%d%m%y%H%M%S'), word.id),
            self.FIELD_IN_ENGLISH: word.foreign_word,
            self.FIELD_IN_RUSSIAN: word.translation,
            self.FIELD_CONTEXT: ''.join(
                ['<div class="context">%s</div>' % c.context for c in
                 word.contexts.all()[:3]]),
            self.FIELD_PIC: '',
            self.FIELD_SOUND: '[sound:%s]' % pron_path,
            self.FIELD_HAS_REVERSE_SIDE: '*' if len(
                word.foreign_word.split(' ')) < 4 else ''
        }
