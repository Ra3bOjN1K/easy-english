from django.contrib.auth.models import User
from django.db import models
from easy_english.services.translator.base import Lang, StructTypes


class ForeignWord(models.Model):
    title = models.CharField(max_length=240)
    type = models.SmallIntegerField(choices=StructTypes.choices(),
                                    default=StructTypes.word.value)
    language = models.SmallIntegerField(choices=Lang.choices(),
                                        default=Lang.english.value)
    transcription = models.CharField(max_length=240, default='')
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ee_foreign_word'


class Translation(models.Model):
    title = models.CharField(max_length=240)
    votes = models.IntegerField(default=0)
    foreign_word = models.ForeignKey(ForeignWord,
                                     related_name='translations')

    class Meta:
        db_table = 'ee_translation'


class WordAssociationPicture(models.Model):
    name = models.CharField(max_length=240)
    foreign_word = models.ForeignKey(
        ForeignWord, related_name='pictures', null=True)
    translation_word = models.ForeignKey(
        Translation, related_name='t_pictures', null=True)

    class Meta:
        db_table = 'ee_word_picture_association'


class UserForeignWord(models.Model):
    user = models.ForeignKey(User, related_name='foreign_words')
    foreign_word = models.CharField(max_length=240)
    translation = models.CharField(max_length=240)
    is_exported = models.BooleanField(default=False)
    is_learned = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ee_user_foreign_word'
        unique_together = ('user', 'foreign_word', 'translation')

    def gen_pronunciation_name(self):
        from _md5 import md5
        return md5(self.foreign_word)


class WordPronunciation(models.Model):
    name = models.CharField(max_length=240)
    foreign_word = models.ForeignKey(ForeignWord,
                                     related_name='pronunciations',
                                     null=True, blank=True)
    user_foreign_word = models.ForeignKey(UserForeignWord,
                                          related_name='ufw_prons',
                                          null=True, blank=True)

    class Meta:
        db_table = 'ee_word_pronunciation'


class UserWordContext(models.Model):
    user_word = models.ForeignKey(UserForeignWord, related_name='contexts')
    context = models.CharField(max_length=240)

    class Meta:
        db_table = 'ee_user_word_context'
