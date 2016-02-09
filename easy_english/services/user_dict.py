# -*- coding: utf-8 -*-


class UserDictionary:
    def __init__(self, user):
        self.user = user

    def mark_exist_translations(self, translated_word):
        from easy_english.models import UserForeignWord

        user_words = UserForeignWord.objects.filter(
            foreign_word=translated_word.word).all()

        if user_words is not None and len(user_words) > 0:
            for t in translated_word.translations:
                t.is_added = t.word in [i.foreign_word for i in user_words]

        return translated_word
