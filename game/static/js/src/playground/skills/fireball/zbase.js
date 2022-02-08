class FireBall extends MyGameObject{
    constructor(playground,player,x,y,radius,vx,vy,speed,move_length,color,damage){
        super();
        this.playground = playground;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx= vx;
        this.vy = vy;
        this.speed = speed;
        this.move_length=move_length;
        this.color=color;
        this.damage=damage;
        this.ctx = this.playground.game_map.ctx;
        this.eps=0.1;
    }

    start(){

    }
    get_dist(x1,y1,x2,y2){
        let dx=x2-x1;
        let dy=y2-y1;
        return Math.sqrt(dx*dx+dy*dy);
    }
    is_collision(player){
        let dist = this.get_dist(this.x,this.y,player.x,player.y);
        if(dist<this.radius+player.radius){
            return true;
        }
        return false;
    }

    update(){
        for(let i=0;i<this.playground.players.length;i++){
            let player = this.playground.players[i];
            if(player != this.player){
                if(this.is_collision(player)){
                    let angle = Math.atan2(player.y-this.y,player.x-this.x);
                    player.is_attack(angle,this.damage);
                    this.destroy();
                    return false;
                }
            }
        }
        if(this.move_length<this.eps){
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed*this.timedelta/1000);
        this.x+=moved*this.vx;
        this.y+=moved*this.vy;
        this.move_length-=moved;
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x*this.playground.scale,this.y*this.playground.scale,this.radius*this.playground.scale,0,Math.PI *2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
    }
}
