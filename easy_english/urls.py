# -*- coding: utf-8 -*-

from django.conf.urls import url

from easy_english import views

urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^api/v1/subtitles', views.SubtitleListView.as_view()),
    url(r'^api/v1/dictionary', views.TranslatorView.as_view()),
]
