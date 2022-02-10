class MultiPlayerSocket{
    constructor(playground){
        this.playground = playground;
        this.uuid = null;
        this.ws = new WebSocket("wss://app1281.acapp.acwing.com.cn/wss/multiplayer/");
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
            }
        }
    }
    receive_create_player(uuid,username,photo){
        let player = new Player(
            this.playground,
            this.playground.width/2/this.playground.scale,
            0.5,
            0.05,
            "white",
            0.25,
            "enemy",
            username,
            photo,
        );
        player.uuid = uuid;
        this.playground.players.push(player);
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
}
