# -*- coding: utf-8 -*-
from enum import Enum

from easy_english.services.translator.translators import LinguaLeoTranslator


class Lang(Enum):
    english = 0

    @classmethod
    def choices(cls):
        return [(x.value, x.name) for x in cls]


class StructTypes(Enum):
    unknown = 0
    word = 1
    phrasal_verb = 2
    sentence = 3

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
    for p in fw.translations.all():
        trans.append({
            'word': p.title,
            'votes': int(p.votes),
            'pictures': [x.name for x in p.t_pictures.all()]
        })

    return Result(
        word=fw.title,
        transcription=fw.transcription,
        pictures=pics,
        pronunciations=prons,
        translations=trans
    )


def _get_result_from_db(word):
    from easy_english.models import ForeignWord
    res = ForeignWord.objects.get(word=word.strip())
    return None if not res else _model_to_result(res)


def _save_result_to_db(result):
    from easy_english.models import (Translation, WordPronunciation,
        WordAssociationPicture, ForeignWord)
    fw = ForeignWord(title=result.word, transcription=result.transcription)
    fw.save()
    for tr in result.translations:
        Translation(title=tr.word, votes=tr.votes, foreign_word=fw).save()
    for pron in result.pronunciations:
        WordPronunciation(name=pron, foreign_word=fw).save()
    for pic in result.pictures:
        WordAssociationPicture(name=pic, foreign_word=fw).save()


def _is_word(word) -> bool:
    return len(word.strip().split(' ')) == 1


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
