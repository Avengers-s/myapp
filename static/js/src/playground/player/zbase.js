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
        this.fireballs = [];
        if(this.character !== "robot"){
            this.img = new Image();
            this.img.src = this.photo;
        }
        if(this.character === "me"){
            this.fireball_coldtime = 2;
            this.fireball_img = new Image();
            this.fireball_img.src= "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.blink_coldtime = 4;
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }

    }
    start(){
        this.playground.player_count++;
        this.playground.notice_board.write("已就绪:"+this.playground.player_count+"人");
        if(this.playground.player_count>=3){
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }
        this.add_listening_events();
        if(this.character === "robot"){
            this.move_to(this.playground.virtual_width * Math.random(),this.playground.virtual_height * Math.random());
        }
    }

    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu",function(){
            return false;
        });
        if(this.character === "me"){
            this.playground.game_map.$canvas.mousedown(function(e){
                if(outer.playground.state!=="fighting"){
                    return true;
                }
                let rect=outer.ctx.canvas.getBoundingClientRect();
                if(e.which === 3){
                    let tx=(e.clientX - rect.left)/outer.playground.scale,ty=(e.clientY - rect.top)/outer.playground.scale;
                    tx += outer.playground.cx;
                    ty += outer.playground.cy;
                    outer.move_to(tx,ty);
                    outer.click_effect(tx,ty);
                    if(outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_move_to(outer.uuid,tx,ty);
                    }
                }else if(e.which === 1){
                    let tx=(e.clientX - rect.left)/outer.playground.scale,ty=(e.clientY - rect.top)/outer.playground.scale;
                    if(outer.cur_skill === "fireball"){
                        tx += outer.playground.cx;
                        ty += outer.playground.cy;
                        let fireball=outer.shoot_fireball(tx,ty);
                        outer.fireball_coldtime= 0.01;
                        outer.cur_skill = null;
                        if(outer.playground.mode === "multi mode"){
                            outer.playground.mps.send_shoot_fireball(tx,ty,fireball.uuid);
                        }
                    }else if(outer.cur_skill === "blink"){
                        tx += outer.playground.cx;
                        ty += outer.playground.cy;
                        outer.blink(tx,ty);
                        outer.cur_skill = null;
                        outer.blink_coldtime = 4;
                        if(outer.playground.mode === "multi mode"){
                            outer.playground.mps.send_blink(tx,ty);
                        }

                    }
                }
            });
            this.playground.game_map.$canvas.keydown(function(e){
                if(e.which === 13){
                    if(outer.playground.mode === "multi mode"){
                        if(outer.playground.chat_state===0){
                            outer.playground.chat_field.show_input();
                            outer.playground.chat_state =1;
                        }else{
                            outer.playground.chat_state=0;
                            outer.playground.chat_field.hide_input();
                        }
                    }
                    return false;
                }

                if(outer.playground.state!=="fighting"){
                    return true;
                }
                if(e.which === 81){
                    if(outer.fireball_coldtime > outer.eps){
                        return true;
                    }
                    outer.cur_skill = "fireball";
                    return false;
                }else if(e.which === 70){
                    if(outer.blink_coldtime>outer.eps){
                        return true;
                    }
                    outer.cur_skill = "blink";
                    return false;
                }
            });
        }
    }
    blink(tx,ty){
        let d=this.get_dist(this.x,this.y,tx,ty);
        d = Math.min(d,0.8);
        let angle = Math.atan2(ty-this.y,tx-this.x);
        this.x+=d*Math.cos(angle);
        this.y+=d*Math.sin(angle);
        this.move_length = 0;
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
        let fireball = new FireBall(this.playground, this, this.x, this.y, this.playground.height*0.01/this.playground.scale,vx,vy,this.playground.height*0.5/this.playground.scale,this.playground.height/this.playground.scale,"orange",this.playground.height*0.01/this.playground.scale);
        this.fireballs.push(fireball);
        return fireball;
    }

    on_destroy(){
        if(this.character === "me" && this.playground.state === "fighting")
        {
            this.playground.state = "over";
            this.playground.score_board.lose();
        }
        for(let i=0;i<this.playground.players.length;i++){
            if(this.playground.players[i]==this){
                this.playground.players.splice(i,1);
                break;
            }
        }
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

    destroy_fireball(uuid){
        for(let i=0;i<this.fireballs.length;i++){
            let fireball = this.fireballs[i];
            if(fireball.uuid == uuid){
                fireball.destroy();
                break;
            }
        }
    }
    receive_attack(x,y,angle,damage,ball_uuid,attacker){
        attacker.destroy_fireball(ball_uuid);
        this.x=x;
        this.y=y;
        this.is_attack(angle,damage);
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
        this.update_win();
        this.update_move();
        if(this.character === "me" && this.playground.state === "fighting"){
            this.update_skill_coldtime();
        }
        this.update_map_view();
        this.render();
    }

    update_win(){
        if(this.playground.state === "fighting" && this.character === "me" && this.playground.players.length === 1){
            this.playground.state = "over";
            this.playground.score_board.win();
        }
    }

    update_map_view(){
        if(this.character === "me"){
            this.playground.cx = this.x - this.playground.width / 2 / this.playground.scale;
            this.playground.cy = this.y - 0.5;
            this.playground.cx = Math.max(0, this.playground.cx);
            this.playground.cx = Math.min(this.playground.virtual_width - this.playground.width / this.playground.scale, this.playground.cx);
            this.playground.cy = Math.max(0, this.playground.cy);
            this.playground.cy = Math.min(this.playground.virtual_height - 1, this.playground.cy);
        }
    }

    update_skill_coldtime(){
        this.fireball_coldtime -= this.timedelta/1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime,0);

        this.blink_coldtime -=this.timedelta /1000;
        this.blink_coldtime = Math.max(this.blink_coldtime,0);
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
                    this.move_to(this.playground.virtual_width * Math.random(),this.playground.virtual_height * Math.random());
                }
            }
        }

    }
    render(){
        if(this.character !== "robot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc((this.x - this.playground.cx)*this.playground.scale, (this.y-this.playground.cy)*this.playground.scale, this.radius*this.playground.scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.playground.cx - this.radius)*this.playground.scale, (this.y - this.playground.cy - this.radius)*this.playground.scale, this.radius * 2*this.playground.scale, this.radius * 2*this.playground.scale); 
            this.ctx.restore();
        }
        else{
            this.ctx.beginPath();
            this.ctx.arc((this.x - this.playground.cx )*this.playground.scale,(this.y - this.playground.cy )*this.playground.scale,this.radius*this.playground.scale,0,Math.PI *2,false);
            this.ctx.fillStyle=this.color;
            this.ctx.fill();
        }

        if(this.character === "me" && this.playground.state === "fighting"){
            this.render_skill_coldtime();
        }
    }
    render_skill_coldtime(){
        let x=1.5,y=0.9,r=0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x*this.playground.scale,y*this.playground.scale,r*this.playground.scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x -r)*this.playground.scale, (y - r)*this.playground.scale, r* 2*this.playground.scale,  r* 2*this.playground.scale); 
        this.ctx.restore();

        if(this.fireball_coldtime > this.eps){
            this.ctx.beginPath();
            this.ctx.moveTo(x*this.playground.scale,y*this.playground.scale);
            this.ctx.arc(x*this.playground.scale,y*this.playground.scale,r*this.playground.scale,0-Math.PI/2,Math.PI *2*(1-this.fireball_coldtime/2 )-Math.PI/2,true);
            this.ctx.lineTo(x*this.playground.scale,y*this.playground.scale);
            this.ctx.fillStyle="rgba(0,0,255,0.6)";
            this.ctx.fill();
        }

        x=1.62,y=0.9,r=0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x*this.playground.scale,y*this.playground.scale,r*this.playground.scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x -r)*this.playground.scale, (y - r)*this.playground.scale, r* 2*this.playground.scale,  r* 2*this.playground.scale); 
        this.ctx.restore();

        if(this.blink_coldtime > this.eps){
            this.ctx.beginPath();
            this.ctx.moveTo(x*this.playground.scale,y*this.playground.scale);
            this.ctx.arc(x*this.playground.scale,y*this.playground.scale,r*this.playground.scale,0-Math.PI/2,Math.PI *2*(1-this.blink_coldtime/4 )-Math.PI/2,true);
            this.ctx.lineTo(x*this.playground.scale,y*this.playground.scale);
            this.ctx.fillStyle="rgba(0,0,255,0.6)";
            this.ctx.fill();
        }


    }

}
