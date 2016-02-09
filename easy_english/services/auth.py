# -*- coding: utf-8 -*-
import logging
from datetime import datetime, timedelta

import pytz
from django.contrib.auth.backends import ModelBackend
from rest_framework import exceptions
from rest_framework.authentication import TokenAuthentication

logger = logging.getLogger(__name__)


class ExpiringTokenAuthentication(TokenAuthentication):

    TOKEN_EXPIRATION_TIME_IN_DAYS = 3

    def authenticate(self, request):
        return super(ExpiringTokenAuthentication, self).authenticate(request)

    def authenticate_credentials(self, key):
        try:
            token = self.model.objects.get(key=key)
        except self.model.DoesNotExist:
            logger.error('Invalid token: %s' % key)
            raise exceptions.AuthenticationFailed('Invalid token')

        if not token.user.is_active:
            logger.error('User \'%s\' inactive or deleted' % token.user.name)
            raise exceptions.AuthenticationFailed('User inactive or deleted')

        # This is required for the time comparison
        utc_now = datetime.utcnow()
        utc_now = utc_now.replace(tzinfo=pytz.utc)

        if token.created < utc_now - timedelta(days=self.TOKEN_EXPIRATION_TIME_IN_DAYS):
            logger.error('Token was created \'%s\' but now has expired' % token.created)
            raise exceptions.AuthenticationFailed('Token has expired')

        return token.user, token


class EasyEnglishModelBackend(ModelBackend):
    def authenticate(self, email=None, password=None, **kwargs):
        from django.contrib.auth.models import User

        if email is None:
            email = kwargs.get('email')
        user = User.objects.filter(email=email).first()
        if user and user.check_password(password):
            return user
        return None

