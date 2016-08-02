from channels import Group
from channels.sessions import channel_session
from channels.auth import http_session_user, channel_session_user, channel_session_user_from_http, http_session
import json
from .models import Room, ConnexionRecord


@channel_session_user_from_http
def ws_connect(message):
    prefix, label = message['path'].strip('/').split('/')
    room = Room.objects.get(label=label)
    Group('chat-' + label).add(message.reply_channel)
    message.channel_session['room'] = room.label

    cr, created = ConnexionRecord.objects.get_or_create(user=message.user.username, room=room)
    cr.instances = 1
    cr.save()

    users = [d['user'] for d in ConnexionRecord.objects.filter(room=room, instances__gt=0).values('user').all()]
    print(users)
    Group('chat-' + label).send({'text': json.dumps({'users': users})})


@channel_session_user
def ws_receive(message):
    label = message.channel_session['room']
    room = Room.objects.get(label=label)
    data = json.loads(message['text'])
    print(data)

    if data.get('action', '') == 'GET_USERS':
        users = [d['user'] for d in ConnexionRecord.objects.filter(room=room, instances__gt=0).values('user').all()]
        print(users)
        Group('chat-' + label).send({'text': json.dumps({'users': users})})
    else:
        m = room.messages.create(handle=message.user.username, message=data['message'])
        Group('chat-' + label).send({'text': json.dumps(m.as_dict())})


@channel_session_user
def ws_disconnect(message):
    label = message.channel_session['room']
    room = Room.objects.get(label=label)
    # message.channel_session['users'].pop(message.user)
    Group('chat-' + label).discard(message.reply_channel)

    cr = ConnexionRecord.objects.get(user=message.user.username, room=room)
    cr.instances = 0
    cr.save()

    users = [d['user'] for d in ConnexionRecord.objects.filter(room=room, instances__gt=0).values('user').all()]
    print(users)
    Group('chat-' + label).send({'text': json.dumps({'users': users})})
