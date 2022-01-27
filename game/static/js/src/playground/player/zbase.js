class Player extends MyGameObject{
    constructor(playground,x,y,radius,color,speed,is_me){
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
        this.eps=0.1;
        this.is_me=is_me;
        this.color = color;
        this.cur_skill = null;
        this.friction = 0.9;
        this.damage_vx=0;
        this.damage_vy=0;
        this.damage_speed=0;
        this.spent_time=0;
    }
    start(){
        this.add_listening_events();
        if(!this.is_me){
            this.move_to(this.playground.width*Math.random(),this.playground.height*Math.random());
        }
    }

    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu",function(){
            return false;
        });
        if(this.is_me){
            this.playground.game_map.$canvas.mousedown(function(e){
                if(e.which === 3){
                    outer.move_to(e.clientX,e.clientY);
                }else if(e.which === 1){
                    if(outer.cur_skill === "fireball"){
                        outer.shoot_fireball(e.clientX,e.clientY);
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

    shoot_fireball(tx, ty){
        let angle = Math.atan2(ty-this.y, tx-this.x);
        let vx=Math.cos(angle);
        let vy=Math.sin(angle);
        new FireBall(this.playground, this, this.x, this.y, this.playground.height*0.01,vx,vy,this.playground.height*0.5,this.playground.height,"orange",this.playground.height*0.01);
    }


    is_attack(angle,damage){
        for(let i=0;i<20+Math.random()*10;i++){
            let x=this.x,y=this.y;
            let radius = this.radius*Math.random()*0.08;
            let angle = Math.PI * 2* Math.random();
            let vx=Math.cos(angle),vy=Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 8;
            let move_length = this.radius * Math.random() * 4;
            new Particle(this.playground, this, x, y, vx, vy, radius, color, speed ,move_length);
        }
        this.radius -= damage;
        if(this.radius < 10){
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
        if(!this.is_me && this.spent_time>4 && Math.random() < 1.0/300){
            let player = this.playground.players[Math.floor(Math.random()*this.playground.players.length)];
            let tx = player.x+player.vx*player.speed*0.2;
            let ty = player.y+player.vy*player.speed*0.2;
            this.shoot_fireball(tx,ty);
        }
        if(this.damage_speed > 50){
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
                if(this.is_me){
                    this.vx=this.vy=0;
                    this.move_length=0;
                }else{
                    this.move_to(this.playground.width*Math.random(),this.playground.height*Math.random());
                }
            }
        }
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI *2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
    }
}
