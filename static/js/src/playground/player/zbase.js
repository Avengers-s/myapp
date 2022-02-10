class Player extends MyGameObject{
    constructor(playground,x,y,radius,color,speed,character,username,photo){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.vx=0;
        this.vy=0;
        this.move_length=0;
        this.speed=speed;
        this.eps=0.01;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.color = color;
        this.cur_skill = null;
        this.friction = 0.9;
        this.damage_vx=0;
        this.damage_vy=0;
        this.damage_speed=0;
        this.spent_time=0;
        if(this.character !== "robot"){
            this.img = new Image();
            this.img.src = this.photo;
        }

    }
    start(){
        this.add_listening_events();
        if(this.character === "robot"){
            this.move_to(this.playground.width*Math.random()/this.playground.scale,this.playground.height*Math.random()/this.playground.scale);
        }
    }

    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu",function(){
            return false;
        });
        if(this.character === "me"){
            this.playground.game_map.$canvas.mousedown(function(e){
                let rect=outer.ctx.canvas.getBoundingClientRect();
                if(e.which === 3){
                    outer.move_to((e.clientX - rect.left)/outer.playground.scale,(e.clientY - rect.top)/outer.playground.scale);
                    outer.click_effect((e.clientX - rect.left)/outer.playground.scale,(e.clientY - rect.top)/outer.playground.scale);
                }else if(e.which === 1){
                    if(outer.cur_skill === "fireball"){
                        outer.shoot_fireball((e.clientX - rect.left)/outer.playground.scale,(e.clientY - rect.top)/outer.playground.scale);
                        outer.cur_skill = null;
                    }
                }
            });
            $(window).keydown(function(e){
                if(e.which === 81){
                    outer.cur_skill = "fireball";
                }
            });
        }
    }

    click_effect(tx, ty){
        for(let i=0;i<20+Math.random()*10;i++){
            let x=tx,y=ty;
            let radius = this.playground.height *0.05 * 0.05 * Math.random();
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = "white";
            let speed = this.playground.height * 0.3;
            let move_length = this.playground.height *0.04 *Math.random();
            new Particle(this.playground,this, x, y, vx, vy, radius/this.playground.scale, color, speed/this.playground.scale, move_length/this.playground.scale);
        }
    }

    shoot_fireball(tx, ty){
        let angle = Math.atan2(ty-this.y, tx-this.x);
        let vx=Math.cos(angle);
        let vy=Math.sin(angle);
        new FireBall(this.playground, this, this.x, this.y, this.playground.height*0.01/this.playground.scale,vx,vy,this.playground.height*0.5/this.playground.scale,this.playground.height/this.playground.scale,"orange",this.playground.height*0.01/this.playground.scale);
    }


    is_attack(angle,damage){
        for(let i=0;i<20+Math.random()*10;i++){
            let x=this.x,y=this.y;
            let radius = this.radius*Math.random()*0.06;
            let angle = Math.PI * 2* Math.random();
            let vx=Math.cos(angle),vy=Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 3;
            let move_length = this.radius * Math.random() * 3;
            new Particle(this.playground, this, x, y, vx, vy, radius, color, speed ,move_length);
        }
        this.radius -= damage;
        if(this.radius < this.eps){
            this.destroy();
            return false;
        }
        this.damage_vx=Math.cos(angle);
        this.damage_vy=Math.sin(angle);
        this.damage_speed = damage*100;
    }


    get_dist(x1,y1,x2,y2){
        let xx=x2-x1;
        let yy=y2-y1;
        return Math.sqrt(xx*xx+yy*yy);
    }
    move_to(tx, ty){
        this.move_length = this.get_dist(this.x,this.y,tx,ty);
        let angle =Math.atan2(ty-this.y,tx-this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }
    update(){
        this.spent_time+=this.timedelta/1000;
        if(this.character === "robot" && this.spent_time>4 && Math.random() < 1.0/300){
            let player = this.playground.players[Math.floor(Math.random()*this.playground.players.length)];
            let tx = player.x+player.vx*player.speed*0.2;
            let ty = player.y+player.vy*player.speed*0.2;
            this.shoot_fireball(tx,ty);
        }
        this.update_move();
        this.render();
    }
    update_move(){
        if(this.damage_speed > this.eps*20 ){
            this.vx=this.vy=0;
            this.move_length=0;
            this.x+=this.damage_vx*this.damage_speed*this.timedelta/1000;
            this.y+=this.damage_vy*this.damage_speed*this.timedelta/1000;
            this.damage_speed *= this.friction;
        }else{
            if(this.move_length>this.eps){
                let moved = Math.min(this.move_length,this.speed*this.timedelta/1000);
                this.x+=this.vx*moved;
                this.y+=this.vy*moved;
                this.move_length-=moved;
            }else{
                if(this.character !== "robot"){
                    this.vx=this.vy=0;
                    this.move_length=0;
                }else{
                    this.move_to(this.playground.width*Math.random()/this.playground.scale,this.playground.height*Math.random()/this.playground.scale);
                }
            }
        }

    }
    render(){
        if(this.character !== "robot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x*this.playground.scale, this.y*this.playground.scale, this.radius*this.playground.scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius)*this.playground.scale, (this.y - this.radius)*this.playground.scale, this.radius * 2*this.playground.scale, this.radius * 2*this.playground.scale); 
            this.ctx.restore();
        }
        else{
            this.ctx.beginPath();
            this.ctx.arc(this.x*this.playground.scale,this.y*this.playground.scale,this.radius*this.playground.scale,0,Math.PI *2,false);
            this.ctx.fillStyle=this.color;
            this.ctx.fill();
        }
    }
}
