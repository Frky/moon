from channels import Group
from channels.sessions import channel_session
from channels.auth import http_session_user, channel_session_user, channel_session_user_from_http, http_session

import logging
import json
from .models import aComptoir, UndergroundComptoir
from .decorators import touch_presence, remove_presence

# Get an instance of a logger
logger = logging.getLogger('chat')


@channel_session_user_from_http
def ws_connect(message):
    Group('global').add(message.reply_channel)


@touch_presence
@channel_session_user
def ws_receive(message):
    payload = json.loads(message['text'])
    logger.debug('message received %s' % payload)

    action = payload.get('action')
    if action == 'JOIN':
        UndergroundComptoir.objects.add(payload.get('comptoir'), message.reply_channel.name, message.user)
    elif action == 'MSG':
        comptoir = payload.get('comptoir')
        Group('comptoir-%s' % comptoir).send({
            'text': json.dumps({
                'action': 'MSG',
                'user': message.user.username,
                'message': payload.get('message'),
                'comptoir': comptoir,
            })
        })
    elif action == 'LEAVE':
        UndergroundComptoir.objects.remove(payload.get('comptoir'), message.reply_channel.name)


@remove_presence
@channel_session_user
def ws_disconnect(message):
    pass
