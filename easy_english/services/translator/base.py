# -*- coding: utf-8 -*-
from enum import Enum

import re

from easy_english.services.translator.translators import LinguaLeoTranslator


class Lang(Enum):
    english = 1

    @classmethod
    def choices(cls):
        return [(x.value, x.name) for x in cls]


class StructTypes(Enum):
    unknown = 1
    word = 2
    phrasal_verb = 3
    sentence = 4

    @classmethod
    def choices(cls):
        return [(x.value, x.name) for x in cls]


class Result:
    word = ''
    transcription = ''
    pronunciations = []
    pictures = []
    translations = []

    def __init__(self, word, transcription, pronunciations, pictures,
                 translations):
        self.word = word
        self.transcription = transcription
        self.pronunciations = pronunciations
        self.pictures = pictures
        self.translations = translations

    @staticmethod
    def get_empty_result():
        return Result('', '', [], [], [])


class TranslationItem:
    word = ''
    votes = 0
    pictures = []

    def __init__(self, word, votes, pictures):
        self.word = word
        self.votes = votes
        self.pictures = pictures


def _model_to_result(fw) -> Result:
    pics = [x.name for x in fw.pictures.all()]
    prons = [x.name for x in fw.pronunciations.all()]
    trans = []
    for p in fw.translations.order_by('-votes').all():
        trans.append(
            TranslationItem(
                word=p.title,
                votes=int(p.votes),
                pictures=[x.name for x in p.t_pictures.all()]
            )
        )

    return Result(
        word=fw.title,
        transcription=fw.transcription,
        pictures=pics,
        pronunciations=prons,
        translations=trans
    )


def _get_result_from_db(word):
    from easy_english.models import ForeignWord
    res = ForeignWord.objects.filter(title=word.strip()).all()
    assert len(res) <= 1, 'Returned more than one value'
    return None if len(res) == 0 else _model_to_result(res.first())


def _save_result_to_db(result):
    from easy_english.models import (Translation, WordPronunciation,
        WordAssociationPicture, ForeignWord)

    if not len(result.translations) or not result.word:
        return

    fw = ForeignWord(title=result.word, transcription=result.transcription)
    fw.save()
    for tr in result.translations:
        translation = Translation(title=tr.word, votes=tr.votes,
                                  foreign_word=fw)
        translation.save()
        for pic in tr.pictures:
            WordAssociationPicture(name=pic,
                                   translation_word=translation).save()

    for pron in result.pronunciations:
        if pron and len(pron.strip()):
            WordPronunciation(name=pron, foreign_word=fw).save()
    for pic in result.pictures:
        if pic and len(pic.strip()):
            WordAssociationPicture(name=pic, foreign_word=fw).save()


_is_word_pattern = re.compile("^[a-z]+([-']?[a-z]+)*$", re.IGNORECASE)


def _is_word(word) -> bool:
    return not _is_word_pattern.search(word) is None


def get_translation(word) -> Result:
    if not word:
        return Result.get_empty_result()
    result = _get_result_from_db(word)
    if result is None:
        translator = LinguaLeoTranslator()
        result = translator.translate(word)
        if _is_word(word):
            _save_result_to_db(result)
    return result
