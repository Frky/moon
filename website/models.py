import logging
import json
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from django.utils.timezone import now

from channels import Group

from .signals import presence_changed


logger = logging.getLogger('chat')


class aComptoirManager(models.Manager):
    def add(self, comptoir_name, user_channel_name, user):
        comptoir, created = self.get_or_create(name=comptoir_name)
        comptoir.add_presence(user_channel_name, user)

    def remove(self, comptoir_name, user_channel_name):
        try:
            room = self.get(name=comptoir_name)
        except aComptoir.DoesNotExist:
            return
        room.remove_presence(user_channel_name)

    def prune_presences(self, channel_layer=None, age=None):
        for comptoir in aComptoir.objects.all():
            comptoir.prune_presences(age)

    def prune_rooms(self):
        aComptoir.objects.filter(presence__isnull=True).delete()


# General (abstract) class for a Comptoir
class aComptoir(models.Model):
    name = models.TextField()

    objects = aComptoirManager()

    @property
    def group_name(self):
        return 'comptoir-%s' % self.name

    def add_presence(self, channel_name, user):
        presence, created = Presence.objects.get_or_create(
            comptoir=self,
            channel_name=channel_name,
            user=user,
        )
        if created:
            Group(self.group_name).add(channel_name)
            self.broadcast_changed(added=presence)

    def remove_presence(self, channel_name=None, presence=None):
        if presence is None:
            try:
                presence = Presence.objects.get(comptoir=self, channel_name=channel_name)
            except Presence.DoesNotExist:
                return
        Group(self.group_name).discard(presence.channel_name)
        presence.delete()
        self.broadcast_changed(removed=presence)

    def get_users(self):
        return User.objects.filter(presence__comptoir=self).distinct()

    def get_anonymous_count(self):
        return self.presence_set.filter(user=None).count()

    def broadcast_changed(self, added=None, removed=None, bulk_change=False):
        if added:
            logger.debug('[%s] joined [%s] on [%s]' % (added.user.username, added.comptoir.name, added.channel_name))

        if removed:
            logger.debug('[%s] has left [%s] on [%s]' % (removed.user.username, removed.comptoir.name, removed.channel_name))

        presence_changed.send(
            sender=self.__class__,
            room=self,
            added=added,
            removed=removed,
            bulk_change=bulk_change,
        )

    def prune_presences(self, age_in_seconds=None):
        if age_in_seconds is None:
            age_in_seconds = getattr(settings, "CHANNELS_PRESENCE_MAX_AGE", 60)

        num_deleted, num_per_type = Presence.objects.filter(
            comptoir=self,
            last_seen__lt=now() - timedelta(seconds=age_in_seconds)
        ).delete()
        if num_deleted > 0:
            self.broadcast_changed(bulk_change=True)


class PresenceManager(models.Manager):
    def touch(self, channel_name):
        self.filter(channel_name=channel_name).update(last_seen=now())

    def leave_all(self, channel_name):
        for presence in self.select_related('comptoir').filter(channel_name=channel_name):
            comptoir = presence.comptoir
            comptoir.remove_presence(presence=presence)


class Presence(models.Model):
    comptoir = models.ForeignKey(aComptoir, on_delete=models.CASCADE)
    channel_name = models.CharField(max_length=255)
    user = models.ForeignKey(User)
    last_seen = models.DateTimeField(default=now)

    objects = PresenceManager()

    class Meta:
        unique_together = [('comptoir', 'channel_name')]


# Anonymous Comptoir
class UndergroundComptoir(aComptoir):
    # This field stores a bcrypt of the comptoir key (if ciphered)
    keyprint = models.CharField(max_length=60, blank=True, null=True)

    objects = aComptoirManager()


class Message(models.Model):
    comptoir = models.ForeignKey(aComptoir, related_name='messages')
    handle = models.TextField()
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    @property
    def formatted_timestamp(self):
        return self.timestamp.strftime('%b %-d %-I:%M %p')

    def as_dict(self):
        return {
                    'action': "MSG",
                    'user': self.handle, 
                    'message': self.content, 
                    'timestamp': self.formatted_timestamp
                }

    def serialize(self, comptoir=None):
        data = self.as_dict()
        if comptoir is not None:
            data["comptoir"] = comptoir.name
        return { 'text': json.dumps(data) }
