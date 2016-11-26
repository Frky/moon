from channels import Group
from channels.sessions import channel_session
from channels.auth import http_session_user, channel_session_user, channel_session_user_from_http, http_session

import hashlib
import logging
import json
from .models import aComptoir, UndergroundComptoir, Message
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
    data = payload.get('data', None)
    if action == 'JOIN':
        UndergroundComptoir.objects.add(data.get('comptoir'), message.reply_channel.name, message.user)
    elif action == 'MSG':
        if data.get('content') != '':
            # this may be a problem if two messages arrive at the same time
            # the comptoir state will not be updated quickly enough
            comptoir = aComptoir.objects.get(name=data.get('comptoir'))
            msg = Message.objects.add(
                    comptoir=comptoir,
                    user=message.user.username,
                    content=data.get('content'),
                )
            # Update comptoir state
            comptoir.state = msg.id
            comptoir.save()
            # TODO checksum
            Group('comptoir-%s' % comptoir.name).send(msg.serialize())
    elif action == 'BROADCAST':
        raise NotImplemented
        if payload.get('message') != '':
            # TODO factorisation
            for comptoir in payload.get('comptoirs'):
                Group('comptoir-%s' % comptoir).send({
                    'text': json.dumps({
                        'action': 'MSG',
                        'user': message.user.username,
                        'message': payload.get('message'),
                        'comptoir': comptoir,
                    })
                })
    elif action == 'SYNC_HISTORY':
        msg_history = list()
        cmptr = None
        for m in data.get("messages"):
            # TODO check existency of comptoir
            m["comptoir"] = aComptoir.objects.get(name=m["comptoir"])
            if cmptr is None: 
                cmptr = m["comptoir"]
            elif cmptr != m["comptoir"]:
                # TODO
                raise Exception
            msg_history.append(Message(**m).as_dict())
        if len(msg_history) > 0:
            Group('comptoir-%s' % cmptr.name).send({
                    'text': json.dumps({
                        'action': 'SYNC_HISTORY', 
                        'data': {
                            'messages': msg_history,
                        },
                    })
                })
    elif action == 'LEAVE':
        UndergroundComptoir.objects.remove(payload.get('comptoir'), message.reply_channel.name)


@remove_presence
@channel_session_user
def ws_disconnect(message):
    pass

