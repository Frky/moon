from channels import Group
from channels.sessions import channel_session
from channels.auth import http_session_user, channel_session_user, channel_session_user_from_http, http_session

import logging
import json
from .models import aComptoir, ConnexionRecord

# Get an instance of a logger
logger = logging.getLogger('socket')


@channel_session_user_from_http
def ws_connect(message):
    logger.debug('%s connected' % message.user.username)
    Group('global').add(message.reply_channel)


@channel_session_user
def ws_receive(message):
    payload = json.loads(message['text'])
    logger.debug('message received %s' % payload)

    action = payload.get('action')
    if action == 'JOIN':
        Group('comptoir-%s' % payload.get('comptoir')).add(message.reply_channel)
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


@channel_session_user
def ws_disconnect(message):
    logger.debug('%s has left' % message.user.username)


@channel_session_user_from_http
def ws_connect_2(message):
    print(message['path'], message['path'].strip('/').split('/'))
    basepath, prefix, label = message['path'].strip('/').split('/')
    comptoir = aComptoir.objects.get(label=label)
    Group('chat-' + label).add(message.reply_channel)
    message.channel_session['comptoir'] = comptoir.label

    cr, created = ConnexionRecord.objects.get_or_create(user=message.user.username, comptoir=comptoir)
    cr.instances = 1
    cr.save()

    users = [d['user'] for d in ConnexionRecord.objects.filter(comptoir=comptoir, instances__gt=0).values('user').all()]
    print(users)
    Group('chat-' + label).send({'text': json.dumps({'users': users})})


@channel_session_user
def ws_receive_2(message):
    label = message.channel_session['comptoir']
    comptoir = aComptoir.objects.get(label=label)
    data = json.loads(message['text'])
    print(data)

    if data.get('action', '') == 'GET_USERS':
        users = [d['user'] for d in ConnexionRecord.objects.filter(comptoir=comptoir, instances__gt=0).values('user').all()]
        print(users)
        Group('chat-' + label).send({'text': json.dumps({'users': users})})
    else:
        m = comptoir.messages.create(handle=message.user.username, message=data['message'])
        Group('chat-' + label).send({'text': json.dumps(m.as_dict())})


@channel_session_user
def ws_disconnect_2(message):
    label = message.channel_session['comptoir']
    comptoir = aComptoir.objects.get(label=label)
    # message.channel_session['users'].pop(message.user)
    Group('chat-' + label).discard(message.reply_channel)

    cr = ConnexionRecord.objects.get(user=message.user.username, comptoir=comptoir)
    cr.instances = 0
    cr.save()

    users = [d['user'] for d in ConnexionRecord.objects.filter(comptoir=comptoir, instances__gt=0).values('user').all()]
    print(users)
    Group('chat-' + label).send({'text': json.dumps({'users': users})})
