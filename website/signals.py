from __future__ import unicode_literals

import json

from django import dispatch
from django.dispatch import receiver

from channels import Group


presence_changed = dispatch.Signal(providing_args=[
    "room", "added", "removed", "bulk_change"
])


@receiver(presence_changed)
def broadcast_presence(sender, room, **kwargs):
    # Broadcast the new list of present users to the room.
    Group(room.group_name).send({
        'text': json.dumps({
            'action': 'PRESENCE',
            'isJoin': kwargs.get('added', None) is not None,
            'comptoir': room.name,
            'users': [user.username for user in room.get_users()],
        })
    })
