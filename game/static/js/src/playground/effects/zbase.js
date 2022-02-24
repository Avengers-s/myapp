class Effects extends MyGameObject {
    constructor(playground,player){
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.time = 0.35;
        this.eps = 0.01;
        this.radius = this.player.radius;
    }
    start(){
        if(Math.random() > 1/3) this.destroy();
    }
    update(){

        this.render();
        this.radius += this.player.radius * 0.13;
        this.time -= this.timedelta / 1000;
        if(this.time < this.eps)this.destroy();
    }
    render(){
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = 0.005 * this.playground.scale;
        this.ctx.strokeStyle = this.player.color;
        this.ctx.arc((this.player.x - this.playground.cx) * this.playground.scale, (this.player.y - this.playground.cy) * this.playground.scale,this.radius* this.playground.scale,0,Math.PI * 2,false);
        this.ctx.stroke();
        this.ctx.restore();
    }
}
