import json

from django.contrib import auth

from channels.tests import ChannelTestCase, apply_routes
from channels.tests.http import HttpClient

from website.routing import channel_routing
from website.models import aComptoir

User = auth.get_user_model()


@apply_routes([channel_routing])
class ComptoirTestCase(ChannelTestCase):
    def setUp(self):
        self.blef = User.objects.create_user('blef', 'blef@blef.fr', 'blefest1BG')

    def test_join_one_comptoir_one_user(self):
        # login as first user
        client = HttpClient()
        client.login(username=self.blef.username, password='blefest1BG')
        client.send_and_consume('websocket.connect')
        client.send_and_consume('websocket.receive', {'text': json.dumps({'action': 'JOIN', 'comptoir': 'plop'})})

        self.assertTrue(aComptoir.objects.filter(name='plop').exists())
