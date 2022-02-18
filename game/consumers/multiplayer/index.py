from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.core.cache import cache
from django.conf import settings
from match_system.src.match_server.match_service import Match
from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from game.models.player.player import Player
from channels.db import database_sync_to_async

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = None
        await self.accept()

    async def disconnect(self, close_code):
        print('disconnect')
        await self.remove_player(self.data)
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name);

    async def remove_player(self, data):
        transport = TSocket.TSocket('localhost', 9090)
        # Buffering is critical. Raw sockets are very slow
        transport = TTransport.TBufferedTransport(transport)

        # Wrap in a protocol
        protocol = TBinaryProtocol.TBinaryProtocol(transport)

        # Create a client to use the protocol encoder
        client = Match.Client(protocol)
        
        # Connect!
        transport.open()
        client.remove_player(data['uuid'], data['username'])
        # Close!
        transport.close()

    async def create_player(self,data):
        # Make socket
        self.uuid = data['uuid']
        self.data = data
        transport = TSocket.TSocket('localhost', 9090)
        # Buffering is critical. Raw sockets are very slow
        transport = TTransport.TBufferedTransport(transport)

        # Wrap in a protocol
        protocol = TBinaryProtocol.TBinaryProtocol(transport)

        # Create a client to use the protocol encoder
        client = Match.Client(protocol)
        def db_get_player():
            return Player.objects.get(user__username=data['username'])

        player = await database_sync_to_async(db_get_player)()

        # Connect!
        transport.open()
        client.add_player(player.score, data['uuid'], data['username'], data['photo'], self.channel_name)
        # Close!
        transport.close()

    async def group_send_event(self,data):
        if not self.room_name:
            room = cache.keys("*%s*" % (self.uuid))
            if room:
                self.room_name = room[0]
        await self.send(text_data = json.dumps(data))

    async def move_to(self,data):
        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': "group_send_event",
                    'event': "move_to",
                    'uuid': data['uuid'],
                    'tx': data['tx'],
                    'ty': data['ty'],
                }
        );

    async def shoot_iceball(self,data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type':"group_send_event",
                'event': "shoot_iceball",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
                'ball_uuid': data['ball_uuid'],
            }
        );
    async def shoot_fireball(self,data):
        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type':"group_send_event",
                    'event': "shoot_fireball",
                    'uuid': data['uuid'],
                    'tx': data['tx'],
                    'ty': data['ty'],
                    'ball_uuid': data['ball_uuid'],
                }
        );

    async def attack(self,data):
        if not self.room_name:
            return 
        players = cache.get(self.room_name)

        if not players:
            return 
        
        remain_cnt = 0
        for player in players:
            if player['uuid'] == data['attackee_uuid']:
                if data['attack_type'] == "fireball":
                    player['hp']-=10
                elif data['attack_type'] == "iceball":
                    player['hp']-=5
            if player['hp'] > 0:
                remain_cnt += 1

        if remain_cnt > 1:
            cache.set(self.room_name, players, 3600)
        else:
            def db_update_player_score(username, score):
                player = Player.objects.get(user__username =username)
                player.score +=score
                player.save()
            for player in players:
                if player['hp'] <= 0 :
                    await database_sync_to_async(db_update_player_score)(player['username'],-5)
                else:
                    await database_sync_to_async(db_update_player_score)(player['username'],10)
            cache.delete(self.room_name)


        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type':"group_send_event",
                    'event':"attack",
                    'uuid': data['uuid'],
                    'attackee_uuid':data['attackee_uuid'],
                    'x':data['x'],
                    'y':data['y'],
                    'angle':data['angle'],
                    'damage':data['damage'],
                    'ball_uuid':data['ball_uuid'],
                    'attack_type':data['attack_type'],
                }
        );

    async def blink(self, data):
        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type':"group_send_event",
                    'event':"blink",
                    'uuid':data['uuid'],
                    'tx':data['tx'],
                    'ty':data['ty'],
                }
        );

    async def send_message(self,data):
        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': "group_send_event",
                    'event': "send_message",
                    'uuid': data['uuid'],
                    'username': data['username'],
                    'text': data['text'],
                }
        );

    async def sync_ring(self,data):
        if not cache.keys("*-%s-*-*" % (self.uuid)):
            return False
        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': "group_send_event",
                    'event': "sync_ring",
                    'uuid': data['uuid'],
                    'mini_radius': data['mini_radius'],
                    'mini_x': data['mini_x'],
                    'mini_y': data['mini_y'],
                    'coldtime': data['coldtime'],
                    'big_coldtime':data['big_coldtime'],
                    'big_ring_state': data['big_ring_state'],
                }
        );

    async def is_in_ring(self,data):
        if not self.room_name:
            return 
        players = cache.get(self.room_name)

        if not players:
            return 
        
        remain_cnt = 0
        for player in players:
            if player['uuid'] == data['uuid']:
                player['hp']-=5
            if player['hp'] > 0:
                remain_cnt += 1

        if remain_cnt > 1:
            cache.set(self.room_name, players, 3600)
        else:
            def db_update_player_score(username, score):
                player = Player.objects.get(user__username =username)
                player.score +=score
                player.save()
            for player in players:
                if player['hp'] <= 0 :
                    await database_sync_to_async(db_update_player_score)(player['username'],-5)
                else:
                    await database_sync_to_async(db_update_player_score)(player['username'],10)
            cache.delete(self.room_name)


        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type':"group_send_event",
                    'event':"is_in_ring",
                    'uuid': data['uuid'],
                }
        );
    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['event'] == "create_player":
            await self.create_player(data)
        elif data['event'] == "move_to":
            await self.move_to(data)
        elif data['event'] == "shoot_fireball":
            await self.shoot_fireball(data)
        elif data['event'] == "attack":
            await self.attack(data)
        elif data['event'] == "blink":
            await self.blink(data)
        elif data['event'] == "send_message":
            await self.send_message(data)
        elif data['event'] == "remove_player":
            await self.remove_player(data)
        elif data['event'] == "shoot_iceball":
            await self.shoot_iceball(data)
        elif data['event'] == "sync_ring":
            await self.sync_ring(data)
        elif data['event'] == "is_in_ring":
            await self.is_in_ring(data)
