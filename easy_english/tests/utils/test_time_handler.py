# -*- coding: utf-8 -*-
from django.test import TestCase

from easy_english.utils.time_handler import time_str_to_seconds


class TimeHandlerTestCase(TestCase):
    TIME_STR_CORRECT = '00:25:43,400'
    CORRECT_INTERVAL = 1543.400
    TIME_STR_INCORRECT = '00;25;43,400'
    TIME_FORMAT_CORRECT = '(\d{2}):(\d{2}):(\d{2}),(\d{3})'
    TIME_FORMAT_INCORRECT = ''

    def test_time_to_milliseconds_successfully(self):
        interval = time_str_to_seconds(self.TIME_STR_CORRECT,
                                       self.TIME_FORMAT_CORRECT)
        self.assertEqual(self.CORRECT_INTERVAL, interval)

    def test_time_to_milliseconds_failure(self):
        with self.assertRaises(AttributeError):
            time_str_to_seconds(self.TIME_STR_CORRECT,
                                self.TIME_FORMAT_INCORRECT)
