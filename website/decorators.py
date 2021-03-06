from __future__ import unicode_literals

import functools
import json

from .models import Presence, aComptoir


def touch_presence(func):
    @functools.wraps(func)
    def inner(message, *args, **kwargs):
        payload = json.loads(message['text'])
        Presence.objects.touch(message.reply_channel.name)
        if payload.get('action') == 'HEARTBEAT':
            return
        return func(message, *args, **kwargs)
    return inner


def remove_presence(func):
    @functools.wraps(func)
    def inner(message, *args, **kwargs):
        Presence.objects.leave_all(message.reply_channel.name)
        return func(message, *args, **kwargs)
    return inner
