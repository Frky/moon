import json
import logging
import time

from django.contrib import auth

from channels.tests import ChannelTestCase, apply_routes
from channels.tests.http import HttpClient

from website.routing import channel_routing
from website.models import aComptoir, Presence

User = auth.get_user_model()

logging.disable(logging.CRITICAL)  # Remove logging under CRITICAL


def _join_comptoir(client, name):
    client.send_and_consume(
        'websocket.receive',
        {'text': json.dumps({'action': 'JOIN', 'comptoir': name})},
    )

@apply_routes([channel_routing])
class ComptoirOneClientTestCase(ChannelTestCase):
    def setUp(self):
        self.password = 'blefest1BG'
        self.blef = User.objects.create_user('blef', 'blef@blef.fr', self.password)

        self.client = HttpClient()
        self.client.login(username=self.blef.username, password=self.password)

    def _leave_comptoir(self, client, name):
        client.send_and_consume(
            'websocket.receive',
            {'text': json.dumps({'action': 'LEAVE', 'comptoir': name})},
        )

    def _check_comptoir_exists(self, name):
        return aComptoir.objects.filter(name=name).exists()

    def _check_user_presence(self, user, comptoir_name, channel_name):
        return Presence.objects.filter(
            user=user,
            comptoir__name=comptoir_name,
            channel_name=channel_name,
        ).exists()

    def test_create_one_comptoir_one_user(self, comptoir_name='plop'):

        self.client.send_and_consume('websocket.connect')
        _join_comptoir(self.client, comptoir_name)

        self.assertTrue(self._check_comptoir_exists(comptoir_name))
        self.assertTrue(self._check_user_presence(self.blef, comptoir_name, self.client.reply_channel))

    def test_create_multi_comptoir_one_user(self):
        comptoirs_names = [
            'Balzac', 'Barthes', 'Bataille', 'Baudelaire', 'Bazin', 'Beaumarchais', 'Beauvoir', 'Beckett', 'Bernanos',
            'Blanchot', 'Boileau', 'Boisrouvray', 'Bossuet', 'Brasillach', 'Breton', 'Camus', 'Celine', 'Cendrars',
            'Char', 'Chardonne', 'Chateaubriand', 'Cioran', 'Claudel', 'Cocteau', 'Colette', 'Constant', 'Corneille',
            'Cros', 'Courteline', '_',
        ]

        self.client.send_and_consume('websocket.connect')

        for name in comptoirs_names:
            _join_comptoir(self.client, name)

            self.assertTrue(self._check_comptoir_exists(name))
            self.assertTrue(self._check_user_presence(self.blef, name, self.client.reply_channel))

    def test_create_bad_names(self):
        comptoirs_names = [
            'Mallarmé', 'Saint-Exupéry', 'Salut!', '$',
        ]

        self.client.send_and_consume('websocket.connect')

        for name in comptoirs_names:
            with self.assertRaisesRegex(AssertionError, 'Invalid group name'):
                _join_comptoir(self.client, name)

    def test_leave_comptoirs(self):
        comptoir_name = 'moon'
        self.test_create_one_comptoir_one_user(comptoir_name)

        self.assertTrue(self._check_user_presence(self.blef, comptoir_name, self.client.reply_channel))

        self._leave_comptoir(self.client, comptoir_name)

        self.assertFalse(self._check_user_presence(self.blef, comptoir_name, self.client.reply_channel))

    def test_simple_users_connected(self):
        names = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
        clients = []

        for name in names:
            user = User.objects.create_user(name, '%s@blef.fr' % name, 'test')

            client = HttpClient()
            client.login(username=user.username, password='test')
            clients.append(client)

            client.send_and_consume('websocket.connect')
            _join_comptoir(client, 'moon')

        comptoir = aComptoir.objects.get(name='moon')
        connected_users = [u.username for u in comptoir.get_users()]

        self.assertListEqual(sorted(names), sorted(connected_users))

        for client in clients:
            client.send_and_consume('websocket.disconnect')

        self.assertTrue(len(comptoir.get_users()) == 0)

    def test_prune_one_presence_default_time(self):
        self.client.send_and_consume('websocket.connect')
        _join_comptoir(self.client, 'moon')

        time.sleep(30)
        aComptoir.objects.prune_presences()

        comptoir = aComptoir.objects.get(name='moon')
        connected_users = [u.username for u in comptoir.get_users()]

        self.assertIn(self.blef.username, connected_users)

        time.sleep(40)

        aComptoir.objects.prune_presences()

        comptoir = aComptoir.objects.get(name='moon')
        connected_users = [u.username for u in comptoir.get_users()]

        self.assertNotIn(self.blef.username, connected_users)

        self.assertTrue(aComptoir.objects.filter(name='moon').exists())
        aComptoir.objects.prune_rooms()
        self.assertFalse(aComptoir.objects.filter(name='moon').exists())

    def test_prune(self):
        self.client.send_and_consume('websocket.connect')
        _join_comptoir(self.client, 'moon')

        time.sleep(5)
        aComptoir.objects.prune_presences(age=10)

        comptoir = aComptoir.objects.get(name='moon')
        connected_users = [u.username for u in comptoir.get_users()]

        self.assertIn(self.blef.username, connected_users)

        time.sleep(10)

        aComptoir.objects.prune_presences(age=10)

        comptoir = aComptoir.objects.get(name='moon')
        connected_users = [u.username for u in comptoir.get_users()]

        self.assertNotIn(self.blef.username, connected_users)

        self.assertTrue(aComptoir.objects.filter(name='moon').exists())
        aComptoir.objects.prune_rooms()
        self.assertFalse(aComptoir.objects.filter(name='moon').exists())


@apply_routes([channel_routing])
class MessageTestCase(ChannelTestCase):
    def setUp(self):
        self.password = 'blefest1BG'
        self.blef = User.objects.create_user('blef', 'blef@blef.fr', self.password)

        self.client = HttpClient()
        self.client.login(username=self.blef.username, password=self.password)

    def test_message(self):
        self.client.send_and_consume('websocket.connect')
        _join_comptoir(self.client, 'moon')

        self.client.send_and_consume(
            'websocket.receive',
            {'text': json.dumps({'action': 'MSG', 'message': 'hey les gars', 'comptoir': 'moon'})},
        )

        self.assertDictEqual(
            json.loads(self.client.receive()['text']),
            {"comptoir": "moon", "isJoin": True, "action": "PRESENCE", "users": ["blef"]}
        )
        
        rcv = self.client.receive()
        self.assertTrue('MSG' == json.loads(rcv['text'])['action'])
        self.assertTrue('hey les gars' == json.loads(rcv['text'])['message'])
