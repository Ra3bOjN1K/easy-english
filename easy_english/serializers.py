# -*- coding: utf-8 -*-
from rest_framework import serializers


class SubtitleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    code = serializers.CharField(max_length=12)
    start = serializers.FloatField()
    end = serializers.FloatField()
    quote = serializers.CharField(max_length=360)

    def create(self, validated_data):
        return super(SubtitleSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        return super(SubtitleSerializer, self).update(instance, validated_data)

    def to_representation(self, value):
        return super(SubtitleSerializer, self).to_representation(value)

    def to_internal_value(self, data):
        return super(SubtitleSerializer, self).to_internal_value(data)


class TranslationItemSerializer(serializers.Serializer):
    word = serializers.CharField(max_length=240)
    votes = serializers.IntegerField()
    pictures = serializers.ListField(
        child=serializers.CharField(max_length=240)
    )

    def create(self, validated_data):
        return super(TranslationItemSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        return super(TranslationItemSerializer, self).update(instance, validated_data)

    def to_representation(self, value):
        return super(TranslationItemSerializer, self).to_representation(value)

    def to_internal_value(self, data):
        return super(TranslationItemSerializer, self).to_internal_value(data)


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

    def create(self, validated_data):
        return super(TranslatorResultSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        return super(TranslatorResultSerializer, self).update(instance, validated_data)

    def to_representation(self, value):
        return super(TranslatorResultSerializer, self).to_representation(value)

    def to_internal_value(self, data):
        return super(TranslatorResultSerializer, self).to_internal_value(data)
