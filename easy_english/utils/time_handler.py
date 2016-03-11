# -*- coding: utf-8 -*-
import re

time_reg_patterns = {}


def time_str_to_seconds(time_str, time_pattern):
    if time_str is None or len(time_str.strip()) == 0:
        raise AttributeError('time_str is None or empty.')
    if not time_reg_patterns.get(time_pattern, None):
        time_reg_patterns.update({time_pattern: re.compile(time_pattern)})
    reg = time_reg_patterns[time_pattern]
    reg_result = reg.match(time_str)
    if not reg_result or not reg_result.re.groups:
        raise AttributeError('time_pattern is incorrect.')
    hour = int(reg_result.group(1))
    minute = int(reg_result.group(2))
    second = int(reg_result.group(3))
    millis = float(reg_result.group(4)) / 1000 if reg_result.group(4) else 0
    return float((hour * 3600) + (minute * 60) + second) + millis
