# -*- coding: utf-8 -*-
import random
from django.contrib.auth import authenticate
from django.utils.translation import ugettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import ValidationError


class AuthTokenSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(email=email, password=password)

            if user:
                if not user.is_active:
                    msg = _('User account is disabled.')
                    raise serializers.ValidationError(msg)
            else:
                msg = _('Unable to log in with provided credentials.')
                raise serializers.ValidationError(msg)
        else:
            msg = _('Must include "email" and "password".')
            raise serializers.ValidationError(msg)

        attrs['user'] = user
        return attrs


class NewUserSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(max_length=60, required=True)
    confirm_password = serializers.CharField(max_length=60, required=True)

    def validate_confirm_password(self, value):
        password = self.initial_data.get('password')
        if password is not None and password == value:
            return value
        raise ValidationError('Password and confirmation are different.')

    def validate_email(self, value):
        from django.contrib.auth.models import User
        user = User.objects.filter(email=value).first()
        if not user:
            return value
        else:
            raise ValidationError('User with same email already exists.')

    def create(self, validated_data):
        from django.contrib.auth.models import User
        username = self.generate_username_by_email(validated_data['email'])
        user = User(username=username, email=validated_data['email'])
        user.set_password(validated_data['password'])
        user.save()
        return user

    def generate_username_by_email(self, email):
        from django.contrib.auth.models import User
        username = name = email.split('@')[0]
        is_unique_name = False
        while not is_unique_name:
            user = User.objects.filter(username=username).first()
            if user:
                username = '%s%d' % (name, random.randint(1, 100))
            else:
                is_unique_name = True
        return username


class SubtitleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    code = serializers.CharField(max_length=12)
    start = serializers.FloatField()
    end = serializers.FloatField()
    quote = serializers.CharField(max_length=360)


class SubtitleListSerializer(serializers.ListSerializer):
    child = SubtitleSerializer()


class TranslationItemSerializer(serializers.Serializer):
    word = serializers.CharField(max_length=240)
    votes = serializers.IntegerField()
    pictures = serializers.ListField(
        child=serializers.CharField(max_length=240)
    )
    is_added = serializers.BooleanField()


class TranslatorResultSerializer(serializers.Serializer):
    word = serializers.CharField(max_length=240)
    transcription = serializers.CharField(max_length=240)
    pronunciations = serializers.ListField(
        child=serializers.CharField(max_length=240)
    )
    pictures = serializers.ListField(
        child=serializers.CharField(max_length=240)
    )
    translations = serializers.ListField(
        child=TranslationItemSerializer()
    )
