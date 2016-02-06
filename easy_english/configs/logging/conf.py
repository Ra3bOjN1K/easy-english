# -*- coding: utf-8 -*-
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'common': {
            'format': '%(levelname).1s: [%(asctime)s] %(module)s->%(funcName)s:%(lineno)d  =>  %(message)s',
            'datefmt': '%d-%m-%Y %H:%M:%S',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'common',
        },
        'file_common': {
            'level': 'DEBUG',
            'class': 'logging.RotatingFileHandler',
            'maxBytes': 1024 * 1024 * 5,
            'backupCount': 7,
            'filename': 'logs/easy_english/common.log',
            'formatter': 'common',
        },
        'file_error': {
            'level': 'ERROR',
            'class': 'logging.RotatingFileHandler',
            'maxBytes': 1024 * 1024 * 5,
            'backupCount': 7,
            'filename': 'logs/easy_english/error.log',
            'formatter': 'common',
        },
    },
    'loggers': {
        'easy_english': {
            'handlers': ['file_common', 'file_error', 'console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
