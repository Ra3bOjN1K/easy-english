# -*- coding: utf-8 -*-

from django.conf.urls import url

from easy_english import views

urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^auth/sign-in', views.SignInUser.as_view()),
    url(r'^auth/login', views.obtain_expiring_auth_token),
    url(r'^auth/logout', views.LogOutUser.as_view()),

    url(r'^api/v1/load-anki-backup', views.download_anki_backup),

    url(r'^api/v1/subtitles', views.SubtitleListView.as_view()),
    url(r'^api/v1/dictionary', views.TranslatorView.as_view()),
    url(r'^api/v1/user-dict', views.UserDictionaryView.as_view()),
]
