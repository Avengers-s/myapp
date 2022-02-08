class Particle extends MyGameObject{
    constructor(playground,player,x,y,vx,vy,radius,color,speed,move_length)
    {
        super();
        this.playground=playground;
        this.player=player;
        this.x=x;
        this.y=y;
        this.vx=vx;
        this.vy=vy;
        this.radius=radius;
        this.color=color;
        this.speed=speed;
        this.eps=0.01;
        this.ctx = this.playground.game_map.ctx;
        this.friction =0.9;
        this.move_length = move_length;
    }
    start(){
        
    }
    update(){
        if(this.speed < this.eps || this.move_length < this.eps){
            this.destroy();
            return false;
        }
        let moved =Math.min(this.move_length,this.speed*this.timedelta/1000);
        this.x+=this.vx*moved;
        this.y+=this.vy*moved;
        this.speed*=this.friction;
        this.move_length -= moved;
        this.render();
    }
    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x*this.playground.scale,this.y*this.playground.scale,this.radius*this.playground.scale,0,Math.PI *2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
    }
}
