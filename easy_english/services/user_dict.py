# -*- coding: utf-8 -*-

from django.db.models import Q


class UserDictionary:
    def __init__(self, user):
        self.user = user

    def mark_exist_translations(self, translated_word):
        from easy_english.models import UserForeignWord

        user_words = UserForeignWord.objects.filter(
            Q(foreign_word__iexact=translated_word.word) &
            Q(user=self.user)
        ).all()

        if user_words is not None and len(user_words) > 0:
            for t in translated_word.translations:
                t.is_added = t.word in [i.translation for i in user_words]

        return translated_word

    def delete_word_by_id(self, word_id):
        from easy_english.models import UserForeignWord
        UserForeignWord.objects.get(id=word_id).delete()

    def mark_word_is_learned(self, word_id, is_learned=True):
        from easy_english.models import UserForeignWord
        word = UserForeignWord.objects.get(id=word_id)
        word.is_learned = is_learned
        word.save()

    def add_word_to_learned(self, word_name):
        from easy_english.models import UserForeignWord
        words = UserForeignWord.objects.filter(
            Q(user=self.user) &
            Q(foreign_word__iexact=word_name)
        ).all()
        if not words:
            word = UserForeignWord()
            word.user = self.user
            word.foreign_word = word_name
            word.translation = ''
            word.is_learned = True
            word.save()
        else:
            for w in words:
                w.is_learned = True
                w.save()

    def del_word_from_learned(self, word_name):
        from easy_english.models import UserForeignWord
        words = UserForeignWord.objects.filter(
            Q(user=self.user) &
            Q(foreign_word__iexact=word_name)
        ).all()
        if words:
            for w in words:
                if not w.translation == '':
                    w.is_learned = False
                    w.save()
                else:
                    w.delete()

    def get_actual_words(self, page_num, items_per_page):
        from easy_english.models import UserForeignWord
        actual_words = UserForeignWord.objects.filter(
            Q(is_learned=False) &
            Q(user=self.user)
        ).order_by('-created').all()
        total_count = len(actual_words)
        start_idx = (page_num - 1) * items_per_page
        return total_count, actual_words[start_idx:page_num * items_per_page]

    def get_learned_words(self, page_num, items_per_page):
        from easy_english.models import UserForeignWord
        words = UserForeignWord.objects.filter(
            Q(is_learned=True) &
            Q(user=self.user)
        ).order_by('-created').all()
        total_count = len(words)
        start_idx = (page_num - 1) * items_per_page
        return total_count, words[start_idx:page_num * items_per_page]

    def get_actual_words_by_id_list(self, list_of_id):
        from easy_english.models import UserForeignWord
        return UserForeignWord.objects.filter(
            Q(is_learned=False) &
            Q(user=self.user) &
            Q(id__in=list_of_id)
        ).order_by('-created').all()

    def mark_actual_words_exported(self, list_of_id):
        for w in self.get_actual_words_by_id_list(list_of_id):
            w.is_exported = not w.is_exported
            w.save()

    def mark_words_status(self, word_list):
        from easy_english.models import UserForeignWord
        word_filter = Q()
        for word in [w.get('word') for w in word_list]:
            word_filter |= Q(foreign_word__iexact=word)
        words_from_db = UserForeignWord.objects.filter(
            Q(user=self.user) &
            word_filter
        ).all()
        for db_word in words_from_db:
            for word in word_list:
                if db_word.foreign_word.lower() == word.get('word').lower():
                    word.update({
                        'is_added': True,
                        'is_learned': db_word.is_learned,
                        'is_exported': db_word.is_exported
                    })
                    break
        return word_list

    def get_all_words(self):
        from easy_english.models import UserForeignWord
        words = UserForeignWord.objects.all()
        return len(words), words
