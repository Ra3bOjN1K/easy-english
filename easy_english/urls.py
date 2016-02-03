# -*- coding: utf-8 -*-

from django.conf.urls import url

from easy_english import views

urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
]
