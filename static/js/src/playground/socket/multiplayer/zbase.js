class MultiPlayerSocket{
    constructor(playground){
        this.playground = playground;
        this.uuid = null;
        this.ws = new WebSocket("wss://wishball.dylolorz.cn/wss/multiplayer/");
        this.start();
    }
    start(){
        this.receive();
    }
    receive(){
        let outer = this;
        this.ws.onmessage=function(e){
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if(uuid === outer.uuid){
                return false;
            }
            let event = data.event;
            if(event === "create_player"){
                outer.receive_create_player(uuid,data.username,data.photo);
            }else if(event === "move_to"){
                outer.receive_move_to(uuid,data.tx,data.ty);
            }else if(event === "shoot_fireball"){
                outer.receive_shoot_fireball(uuid,data.tx,data.ty,data.ball_uuid);
            }else if(event === "attack"){
                outer.receive_attack(uuid,data.attackee_uuid,data.x,data.y,data.angle,data.damage,data.ball_uuid,data.attack_type);
            }else if(event === "blink"){
                outer.receive_blink(uuid,data.tx,data.ty);
            }else if(event === "send_message"){
                outer.receive_message(uuid,data.username,data.text);
            }else if(event === "shoot_iceball"){
                outer.receive_shoot_iceball(uuid,data.tx,data.ty,data.ball_uuid);
            }else if(event === "sync_ring"){
                outer.receive_sync_ring(uuid, data.mini_radius,data.mini_x,data.mini_y,data.coldtime,data.big_coldtime,data.big_ring_state);
            }else if(event === "is_in_ring"){
                outer.receive_is_in_ring(uuid);
            }
        }
    }
    send_message(username,text){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "send_message",
            'uuid': outer.uuid,
            'username': username,
            'text': text,
        }));
    }

    receive_message(uuid,username,text){
        this.playground.chat_field.add_message(username,text);
    }

    receive_is_in_ring(uuid){
        let player = this.get_player(uuid);
        if(player){
            player.hp -= 5;
            if(player.hp <= 0){
                player.destroy();
                return false;
            }
        }
    }

    receive_create_player(uuid,username,photo){
        let player = new Player(
            this.playground,
            this.playground.virtual_width /2,
            1.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );
        player.uuid = uuid;
        this.playground.players.push(player);
    }

    receive_sync_ring(uuid,mini_radius,mini_x,mini_y,coldtime,big_coldtime,big_ring_state){
        this.playground.ring.mini_radius = mini_radius;
        this.playground.ring.mini_x = mini_x;
        this.playground.ring.mini_y = mini_y;
        this.playground.ring.coldtime = coldtime;
        this.playground.ring.big_coldtime = big_coldtime;
        this.playground.big_ring_state = big_ring_state;
    }

    send_sync_ring(mini_radius,mini_x,mini_y,coldtime,big_coldtime,big_ring_state){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "sync_ring",
            'uuid': outer.uuid,
            'mini_radius': mini_radius,
            'mini_x': mini_x,
            'mini_y': mini_y,
            'coldtime': coldtime,
            'big_coldtime': big_coldtime,
            'big_ring_state': big_ring_state,
        }));
    }

    send_is_in_ring(){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "is_in_ring",
            'uuid': outer.uuid,
        }));
    }
    send_create_player(username,photo){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }
    send_move_to(uuid,tx,ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }
    get_player(uuid){
        for(let i=0;i<this.playground.players.length;i++){
            let player = this.playground.players[i];
            if(player.uuid === uuid){
                return player;
            }
        }
        return null;
    }
    receive_move_to(uuid,tx,ty){
        let player = this.get_player(uuid);
        if(player){
            player.move_to(tx,ty);
        }
    }
    send_shoot_fireball(tx,ty,ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }

    send_shoot_iceball(tx,ty,ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_iceball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }
    receive_shoot_fireball(uuid,tx,ty,ball_uuid){
        let player = this.get_player(uuid);
        if(player){
            let fireball=player.shoot_fireball(tx,ty);
            fireball.uuid = ball_uuid;
        }
    }
    receive_shoot_iceball(uuid,tx,ty,ball_uuid){
        let player = this.get_player(uuid);
        if(player){
            let iceball = player.shoot_iceball(tx,ty);
            iceball.uuid = ball_uuid;
        }
    }
    send_attack(attackee_uuid,x,y,angle,damage,ball_uuid,attack_type){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x':x,
            'y':y,
            'angle':angle,
            'damage':damage,
            'ball_uuid':ball_uuid,
            'attack_type': attack_type,
        }));
    }

    send_remove_player(username){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "remove_player",
            'uuid' : outer.uuid,
            'username': username,
        }));
    }

    receive_attack(uuid,attackee_uuid,x,y,angle,damage,ball_uuid,attack_type){
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if(attacker && attackee){
            attackee.receive_attack(x,y,angle,damage,ball_uuid,attacker,attack_type);
        }
    }

    send_blink(tx,ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event':"blink",
            'uuid': outer.uuid,
            'tx':tx,
            'ty':ty,
        }));
    }
    receive_blink(uuid,tx,ty){
        let player = this.get_player(uuid);
        if(player)player.blink(tx,ty);
    }

}
