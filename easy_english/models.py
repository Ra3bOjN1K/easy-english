from django.db import models


class ForeignWord(models.Model):
    TYPE_UNKNOWN = 0
    TYPE_NOUN = 1
    TYPE_PRONOUN = 2
    TYPE_VERB = 3
    TYPE_ADJECTIVE = 4
    TYPE_ADVERB = 5
    TYPE_PREPOSITION = 6
    TYPE_CONJUNCTION = 7
    TYPE_INTERJECTION = 8

    WORD_TYPES = (
        (TYPE_UNKNOWN, 'Unknown'),
        (TYPE_NOUN, 'Noun'),
        (TYPE_UNKNOWN, 'Pronoun'),
        (TYPE_UNKNOWN, 'Verb'),
        (TYPE_UNKNOWN, 'Adjective'),
        (TYPE_UNKNOWN, 'Adverb'),
        (TYPE_UNKNOWN, 'Preposition'),
        (TYPE_UNKNOWN, 'Conjunction'),
        (TYPE_UNKNOWN, 'Interjection'),
    )

    LANG_ENGLISH = 'eng'
    LANGUAGES = ((LANG_ENGLISH, 'English'),)

    title = models.CharField(max_length=240)
    type = models.SmallIntegerField(choices=WORD_TYPES, default=TYPE_UNKNOWN)
    language = models.CharField(max_length=3, choices=WORD_TYPES,
                                default=LANG_ENGLISH)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ee_foreign_word'


class Translation(models.Model):
    title = models.CharField(max_length=240)
    votes = models.IntegerField(default=0)
    foreign_word = models.ForeignKey(ForeignWord,
                                     related_name='translation_foreign_word')

    class Meta:
        db_table = 'ee_translation'


class WordAssociationPicture(models.Model):
    name = models.CharField(max_length=240)
    foreign_word = models.ForeignKey(ForeignWord,
                                     related_name='assoc_foreign_word')

    class Meta:
        db_table = 'ee_word_picture_association'


class WordPronunciation(models.Model):
    name = models.CharField(max_length=240)
    foreign_word = models.ForeignKey(ForeignWord,
                                     related_name='pronunciation_foreign_word')

    class Meta:
        db_table = 'ee_word_pronunciation'
