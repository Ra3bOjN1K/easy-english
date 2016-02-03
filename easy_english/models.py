from django.db import models

from easy_english.model_fields import ForeignWordTypeField


class ForeignWord(models.Model):
    title = models.CharField(max_length=240)
    type = ForeignWordTypeField(
        max_length=1, choices=((0, 'Unknown'), (1, 'Verb'), (2, 'Noun')))


class Translation(models.Model):
    pass


class WordAssociationPicture(models.Model):
    pass


class WordPronunciation(models.Model):
    pass
