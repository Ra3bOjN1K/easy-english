# -*- coding: utf-8 -*-
from django.test import TestCase, RequestFactory

from easy_english.views import SignInUser


class SignInUserTestCase(TestCase):
    AUTH_URL = '/auth/sign-in'
    USER_EMAIL = 'englishman@gmail.com'
    USER_PASS = '12345'
    USER_CONFIRM_PASS = '12345'

    def setUp(self):
        self.factory = RequestFactory()

    def test_sign_in_user_successfully(self):
        request = self.factory.post(self.AUTH_URL, data={
            'email': self.USER_EMAIL,
            'password': self.USER_PASS,
            'confirm_password': self.USER_CONFIRM_PASS
        })
        response = SignInUser().as_view()(request)
        self.assertEqual(200, response.status_code)
