class Mini_Map extends MyGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.p = 3.5;//缩小比例
        this.width = this.playground.width / this.p;
        this.height = this.playground.height / this.p;
    }

    start(){

    }

    resize(){
        this.width = this.playground.width / this.p;
        this.height = this.playground.height / this.p;
    }

    update(){
        this.render();
    }

    render(){
        this.ctx.save();
        this.ctx.fillStyle="rgba(0,0,0,0.4)";
        this.ctx.fillRect(0,0,this.width, this.height);
        this.ctx.strokeStyle = "rgba(0,0,0,0.4)";
        this.lineWidth = 0.007 * this.playground.scale;
        this.ctx.strokeRect(0,0,this.width, this.height);
        for(let i=0; i<this.playground.players.length; i++){
            let player = this.playground.players[i];
            let x = player.x / this.playground.p / this.p;
            let y = player.y / this.playground.p / this.p;
            let radius = player.radius / this.p;
            this.ctx.beginPath();
            this.ctx.arc(x * this.playground.scale, y *this.playground.scale, radius *this.playground.scale,0,Math.PI*2,false);
            this.ctx.fillStyle = player.color;
            this.ctx.fill();
        }
        this.ctx.restore();
        this.render_focus_player_effect();
    }
    render_focus_player_effect(){
        for(let i=0; i<this.playground.players.length; i++){
            let player = this.playground.players[i];
            let x = player.x / this.playground.p / this.p;
            let y = player.y / this.playground.p / this.p;
            let radius = player.radius / this.p;
            if(player.character === "me"){
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.moveTo(x * this.playground.scale, (y - radius - 0.027) * this.playground.scale);
                this.ctx.lineTo((x + radius + 0.001) * this.playground.scale, (y - radius - 0.007) * this.playground.scale);
                this.ctx.lineTo((x - radius - 0.001) * this.playground.scale, (y - radius - 0.007) * this.playground.scale);
                this.ctx.closePath();
                this.ctx.fillStyle = "orange";
                this.ctx.fill();
                this.ctx.restore();
                break;
            }
        }
    }
}
