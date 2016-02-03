# -*- coding: utf-8 -*-

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.deconstruct import deconstructible


@deconstructible
class EnumValidator:
    enum_values = ''
    message = 'Enum does not contain passed value.'
    code = 'invalid'

    def __init__(self, enum_values):
        if type(enum_values) not in (tuple,):
            raise AttributeError('Parameter \'enum_value\' should be tuple.')
        self.enum_values = enum_values

    def __call__(self, value):
        if not (value in [x[0] for x in self.enum_values]):
            raise ValidationError(self.message, code=self.code)

    def __eq__(self, other):
        return (
            isinstance(other, EnumValidator) and
            self.enum_values == other.enum_values
        )


class ForeignWordTypeField(models.CharField):
    def __init__(self, *args, **kwargs):
        choices = kwargs.get('choices', None)
        super(ForeignWordTypeField, self).__init__(*args, **kwargs)
        self.validators.append(EnumValidator(enum_values=choices))
