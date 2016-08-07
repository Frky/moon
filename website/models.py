from django.db import models
from django.utils import timezone

from django.contrib.auth.models import User

class Comptoir(models.Model):
    name = models.TextField()
    label = models.SlugField(unique=True)

class Message(models.Model):
    comptoir = models.ForeignKey(Comptoir, related_name='messages')
    handle = models.TextField()
    message = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    @property
    def formatted_timestamp(self):
        return self.timestamp.strftime('%b %-d %-I:%M %p')

    def as_dict(self):
        return {'handle': self.handle, 'message': self.message, 'timestamp': self.formatted_timestamp}


class ConnexionRecord(models.Model):
    room = models.ForeignKey(Room, related_name='connexion')
    user = models.CharField(max_length=256)
    instances = models.IntegerField(default=0)

    first_connexion = models.DateTimeField(auto_now_add=True)
    last_event = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('room', 'user')
