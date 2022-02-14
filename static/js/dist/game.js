class MyGameMenu{
    constructor(root){
        this.root = root;
        this.$menu = $(`
            <div class="my_game_menu">
                <div class="my_game_menu_field">
                    <div class="my_game_menu_field_item my_game_menu_field_item_single_mod">
                        单人模式
                    </div>
                    <br>
                    <div class="my_game_menu_field_item my_game_menu_field_item_multi_mod">
                        多人模式
                    </div>
                    <br>
                    <div class="my_game_menu_field_item my_game_menu_field_item_settings_mod">
                        退出
                    </div>
                </div>
            </div>
        `);
        this.hide();
        this.root.$my_game.append(this.$menu);
        this.$single_mod = this.$menu.find(".my_game_menu_field_item_single_mod");
        this.$multi_mod = this.$menu.find(".my_game_menu_field_item_multi_mod");
        this.$settings_mod = this.$menu.find(".my_game_menu_field_item_settings_mod");
        this.start();
    }
    start(){
        this.add_listening_events();
    }
    add_listening_events(){
        let outer = this;
        this.$single_mod.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi_mod.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });
        this.$settings_mod.click(function(){
            outer.root.settings.logout_on_remote();
        });
    }
    hide(){
        this.$menu.hide();
    }
    show(){
        this.$menu.show();
    }
}
let my_game_objects = [];
class MyGameObject{
    constructor(){
        my_game_objects.push(this);
        this.has_called_start=false;
        this.timedelta=0;
        this.uuid = this.create_uuid();
    }
    start(){

    }

    last_update(){

    }

    create_uuid(){
        let res="";
        for(let i=0;i<8;i++){
            let x = Math.floor(Math.random()*10);
            res+=x;
        }
        return res;
    }

    update(){

    }

    on_destroy(){
    
    }

    destroy(){
        this.on_destroy();
        for(let i=0; i<my_game_objects.length; i++){
            let obj=my_game_objects[i];
            if(obj === this){
                my_game_objects.splice(i,1);
            }
        }
    }
}

let last_stamp;
let MY_GAME_ANIMATION=function(stamp){
    for(let i=0;i<my_game_objects.length;i++){
        let obj=my_game_objects[i];
        if(!obj.has_called_start){
            obj.has_called_start=true;
            obj.start();
        }else{
            obj.timedelta=stamp-last_stamp;
            obj.update();
        }
    }
    for(let i=0;i<my_game_objects.length;i++){
        let obj = my_game_objects[i];
        obj.last_update();
    }
    last_stamp = stamp;
    requestAnimationFrame(MY_GAME_ANIMATION);
}

requestAnimationFrame(MY_GAME_ANIMATION);
class ChatField {
    constructor(playground){
        this.playground = playground;
        this.$history = $(`<div class="my_game_chat_field_history">历史记录<div>`);
        this.$input = $('<input type="text" class="my_game_chat_field_input">');
        this.$history.hide();
        this.$input.hide();
        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);
        this.func_id=null;
        this.start();
    }
    start(){
        this.add_listening_events();
    }
    add_listening_events(){
        let outer = this;
        this.$input.keydown(function(e){
            if(e.which === 13){
                let text = outer.$input.val();
                if(!text){
                    outer.playground.chat_state =0;
                    outer.hide_input();
                    return false;
                }
                let username = outer.playground.root.settings.username;
                if(text){
                    outer.$input.val("");
                    outer.add_message(username,text);
                    outer.playground.mps.send_message(username,text);
                }
                return false;
            }
        });
    }
    render_message(message){
        return $(`<div>${message}</div>`);
    }
    add_message(username,text){
        this.show_history();
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    hide_input(){
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }

    show_input(){
        this.show_history();
        this.$input.show();
        this.$input.focus();
    }

    show_history(){
        let outer = this;
        this.$history.fadeIn();

        if(this.func_id)clearTimeout(this.func_id);
        this.func_id = setTimeout(function(){
            outer.$history.fadeOut();
            outer.func_id=null;
        },3000);
    }
}
class Grid extends MyGameObject{
    constructor(playground, x, y, r){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.r = r;
    }
    start(){

    }

    update(){
        this.render();
    }

    render(){
        let w = this.playground.virtual_width / 32;
        let h = this.playground.virtual_height / 18;
        let r = 18, c = 32;
        for(let i = 0;i < r ; i++){
            for(let j=0; j<c; j++){
                let cx = j * w, cy = i * h;
                let color = "rgba(55,55,55,0.5)";
                this.ctx.fillStyle = color;
                this.ctx.fillRect((cx - this.playground.cx) * this.playground.scale, (cy - this.playground.cy) * this.playground.scale, w * this.playground.scale, h *this.playground.scale);
                this.ctx.strokeStyle = "rgba(55, 55, 55, 0.5)";
                this.ctx.lineWidth = 0.005 * this.playground.scale;
                this.ctx.strokeRect((cx - this.playground.cx) * this.playground.scale, (cy - this.playground.cy) * this.playground.scale, w * this.playground.scale, h * this.playground.scale);

            }
        }
    }
}
class Game_Map extends MyGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
   
    }
    start(){
        this.$canvas.focus();
    }
    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle="rgba(0,0,0,1)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
    }
    update(){
        this.render();
    }
    render(){
        this.ctx.fillStyle="rgba(0,0,0, 1)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
       // this.ctx.fillStyle="rgba(100,100,100, 0.2)";
        //this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
    }

}
class NoticeBoard extends MyGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text="已就绪:0人";
    }
    start(){

    }
    write(text){
        this.text = text;
    }
    update(){
        this.render();
    }
    render(){
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width/2, 20);
    }
}
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
        if(this.speed < this.eps * 1.5 || this.move_length < this.eps * 1.5){
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
        this.ctx.arc((this.x - this.playground.cx)*this.playground.scale,(this.y-this.playground.cy)*this.playground.scale,this.radius*this.playground.scale,0,Math.PI *2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
    }
}
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
        d = Math.min(d,0.4);
        let angle = Math.atan2(ty-this.y,tx-this.x);
        this.x+=d*Math.cos(angle);
        this.y+=d*Math.sin(angle);
        this.move_length = 0;
    }
    click_effect(tx, ty){
        for(let i=0;i<20+Math.random()*10;i++){
            let x=tx,y=ty;
            let radius = this.playground.height *0.06 * 0.06 * Math.random();
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = "white";
            let speed = this.playground.height * 0.5;
            let move_length = this.playground.height *0.05 *Math.random();
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
            let radius = this.radius*Math.random()*0.08;
            let angle = Math.PI * 2* Math.random();
            let vx=Math.cos(angle),vy=Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 4;
            let move_length = this.radius * Math.random() * 6;
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
        if(this.character === "robot" && this.spent_time > 3 && Math.random() < 1.0/100){
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
        if(this.username === "admin") console.log(this.x, this.y);
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
class ScoreBoard extends MyGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.win_img = new Image();
        this.lose_img = new Image();
        this.win_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_8f58341a5e-win.png";
        this.lose_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_9254b5f95e-lose.png";
        this.state = "null";
    }

    start(){
        
    }

    add_listening_events(){
        let outer = this;
        let $canvas = this.playground.game_map.$canvas;

        $canvas.on('click', function() {
            outer.playground.hide();
            outer.playground.root.menu.show();
        });


    }

    win(){
        this.state = "win";
        let outer = this;
        setTimeout(function(){
            outer.add_listening_events();
        }, 1000);
    }

    lose(){
        this.state = "lose";
        let outer = this;
        setTimeout(function(){
            outer.add_listening_events();
        },1000);
    }

    update(){
        this.render();
    }

    render(){
        let len = this.playground.height / 2;
        if(this.state === "win"){
            this.ctx.drawImage(this.win_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }else if(this.state === "lose"){
            this.ctx.drawImage(this.lose_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2 , len, len);
        }
    }

}
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
        if(this.player.character !== "enemy"){
            this.update_attack();
        }
        this.update_move();
        this.render();
    }
    update_attack(){
        for(let i=0;i<this.playground.players.length;i++){
            let player = this.playground.players[i];
            if(player != this.player){
                if(this.is_collision(player)){
                    let angle = Math.atan2(player.y-this.y,player.x-this.x);
                    player.is_attack(angle,this.damage);
                    if(this.playground.mode === "multi mode"){
                        this.playground.mps.send_attack(player.uuid,player.x,player.y,angle,this.damage,this.uuid);
                    }
                    this.destroy();
                    return false;
                }
            }
        }
    }
    update_move(){
        if(this.move_length<this.eps){
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed*this.timedelta/1000);
        this.x+=moved*this.vx;
        this.y+=moved*this.vy;
        this.move_length-=moved;
    }
    on_destroy(){
        let fireballs = this.player.fireballs;
        for(let i=0;i<fireballs.length;i++){
            let fireball = fireballs[i];
            if(fireball.uuid === this.uuid){
                fireballs.splice(i,1);
                break;
            }
        }
    }
    render(){
        this.ctx.beginPath();
        this.ctx.arc((this.x - this.playground.cx)*this.playground.scale,(this.y - this.playground.cy) * this.playground.scale,this.radius*this.playground.scale,0,Math.PI *2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
    }
}
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
            }else if(event === "move_to"){
                outer.receive_move_to(uuid,data.tx,data.ty);
            }else if(event === "shoot_fireball"){
                outer.receive_shoot_fireball(uuid,data.tx,data.ty,data.ball_uuid);
            }else if(event === "attack"){
                outer.receive_attack(uuid,data.attackee_uuid,data.x,data.y,data.angle,data.damage,data.ball_uuid);
            }else if(event === "blink"){
                outer.receive_blink(uuid,data.tx,data.ty);
            }else if(event === "send_message"){
                outer.receive_message(uuid,data.username,data.text);
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
    receive_shoot_fireball(uuid,tx,ty,ball_uuid){
        let player = this.get_player(uuid);
        if(player){
            let fireball=player.shoot_fireball(tx,ty);
            fireball.uuid = ball_uuid;
        }
    }
    send_attack(attackee_uuid,x,y,angle,damage,ball_uuid){
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

    receive_attack(uuid,attackee_uuid,x,y,angle,damage,ball_uuid){
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if(attacker && attackee){
            attackee.receive_attack(x,y,angle,damage,ball_uuid,attacker);
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
class MyGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="my_game_playground"></div>`);
        this.hide();
        this.player_count=0;
        this.chat_state = 0;
        this.cx = 0;
        this.cy = 0;
        this.start();
    }
    create_uuid(){
        let res="";
        for(let i =0;i<8;i++){
            res += Math.floor(Math.random() * 10);
        }
        return res;

    }
    get_random_color(){
        let colors=["red","grey","green","pink","yellow","blue","orange"];
            return colors[Math.floor(Math.random()*colors.length)];
    }
    start(){
        this.root.$my_game.append(this.$playground);
        let outer = this;
        let uuid = this.create_uuid();
        
        $(window).on(`resize.${uuid}`,(function(){
            outer.resize();
        }));

        if(this.root.AcwingOS){
            this.root.AcwingOS.api.window.on_close(function(){
                $(window).off(`resize.${uuid}`);
            });
        }
    }
    resize(){
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width/16,this.height/9);
        this.width = unit*16;
        this.height = unit*9;
        this.scale = this.height;
        this.virtual_width = this.width / this.scale * 3;
        this.virtual_height = 3;
        this.cx = this.virtual_width / 2 - this.width / 2 / this.scale;
        this.cy = this.virtual_height / 2 - this.height / 2 / this.scale;
        if(this.game_map)this.game_map.resize();
    }
    show(mode){
        this.$playground.show();
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new Game_Map(this);
        this.grid = new Grid(this);
        this.notice_board = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.player_count = 0;
        this.state = "waiting"; //waiting -> fighting -> over
        this.resize();
        this.players = [];
        this.mode=mode;
        this.players.push(new Player(this,this.virtual_width / 2,this.virtual_height / 2,this.height*0.05/this.scale,"white",this.height*0.15/this.scale,"me",this.root.settings.username,this.root.settings.photo));
        if(mode === "single mode"){
            for(let i=0;i<15;i++){
                this.players.push(new Player(this,this.virtual_width * Math.random(),this.virtual_height * Math.random() ,this.height*0.05/this.scale,this.get_random_color(),this.height*0.15/this.scale,"robot"));
            }
        }else{
            let outer = this;
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen=function(){
                outer.mps.send_create_player(outer.root.settings.username,outer.root.settings.photo);
                if(outer.root.AcwingOS)outer.root.AcwingOS.api.window.on_close(function(){
                    outer.mps.send_remove_player(outer.root.settings.username);
                });
            };
        }
    }
    hide(){
        while (this.players && this.players.length > 0) {
            this.players[0].destroy();
        }

        if (this.game_map) {
            this.game_map.destroy();
            this.game_map = null;
        }

        if (this.notice_board) {
            this.notice_board.destroy();
            this.notice_board = null;
        }

        if (this.score_board) {
            this.score_board.destroy();
            this.score_board = null;
        }
        if(this.grid){
            this.grid.destroy();
            this.grid = null;
        }
        this.$playground.empty();

        this.$playground.hide();
    }
}
class Settings {
    constructor(root){
        this.root = root;
        this.platform = "WEB";
        this.username = "";
        this.photo ="";
        if(this.root.AcwingOS)this.platform = "ACAPP";
        this.$settings = $(`
<div class="my_game_settings">
    <div class="my_game_settings_login">
        <div class="my_game_settings_title">
            登录
        </div>
        <div class="my_game_settings_username">
            <div class="my_game_settings_item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="my_game_settings_password">
            <div class="my_game_settings_item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="my_game_settings_submit">
            <div class="my_game_settings_item">
                <button>登录</button>
            </div>
        </div>
        <div class="my_game_settings_error_message">
        </div>
        <div class="my_game_settings_option">
            注册
        </div>
        <br>
        <div class="my_game_settings_acwing">
            <img width="30" src="https://app1281.acapp.acwing.com.cn/static/image/settings/aclogo.jpg">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>

    <div class="my_game_settings_register">
        <div class="my_game_settings_title">
            注册
        </div>
        <div class="my_game_settings_username">
            <div class="my_game_settings_item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="my_game_settings_password my_game_settings_password_first">
            <div class="my_game_settings_item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="my_game_settings_password my_game_settings_password_second">
            <div class="my_game_settings_item">
                <input type="password" placeholder="确认密码">
            </div>
        </div>
        <div class="my_game_settings_submit">
            <div class="my_game_settings_item">
                <button>注册</button>
            </div>
        </div>
        <div class="my_game_settings_error_message">
        </div>
        <div class="my_game_settings_option">
            登录
        </div>
        <br>
        <div class="my_game_settings_acwing">
            <img width="30" src="https://app1281.acapp.acwing.com.cn/static/image/settings/aclogo.jpg">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
</div>
`);
        this.root.$my_game.append(this.$settings);
        this.$login = this.$settings.find(".my_game_settings_login");
        this.$login_username = this.$login.find(".my_game_settings_username input");
        this.$login_password = this.$login.find(".my_game_settings_password input");
        this.$login_submit = this.$login.find(".my_game_settings_submit button");
        this.$login_acwing = this.$login.find(".my_game_settings_acwing img");
        this.$login_error_message = this.$login.find(".my_game_settings_error_message");
        this.$login_register = this.$login.find(".my_game_settings_option");
        this.$login.hide();
        this.$register = this.$settings.find(".my_game_settings_register");
        this.$register_username = this.$register.find(".my_game_settings_username input");
        this.$register_password = this.$register.find(".my_game_settings_password_first input");
        this.$register_password_confirm = this.$register.find(".my_game_settings_password_second input");
        this.$register_submit = this.$register.find(".my_game_settings_submit button");
        this.$register_acwing = this.$register.find(".my_game_settings_acwing img");
        this.$register_error_message = this.$register.find(".my_game_settings_error_message");
        this.$register_login = this.$register.find(".my_game_settings_option");
        this.$acwing_login = this.$settings.find(".my_game_settings_acwing img");
        this.$register.hide();
        this.start();
    }
    start(){
        if(this.platform === "WEB")
        {
            this.getinfo_web();
            this.add_listening_events();
        }
        else this.getinfo_acapp();
    }
    add_listening_events(){
        let outer = this;
        this.$login_register.click(function(){
            outer.register();
        });

        this.$login_submit.click(function(){
            outer.login_on_remote();
        });
        this.$register_login.click(function(){
            outer.login();
        });
        this.$register_submit.click(function(){
            outer.register_on_remote();
        });
        this.$acwing_login.click(function(){
            outer.acwing_login();
        });
    }
    
    acwing_login(){
        
        $.ajax({
            url: "https://app1281.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function(resp){
                if(resp.result==="success"){
                    window.location.replace(resp.apply_code_url);
                }
            },
        });
    }
    logout_on_remote(){
        if(this.root.AcwingOS){
            this.root.AcwingOS.api.window.close();
            return false;
        }
        $.ajax({
            url: "https://app1281.acapp.acwing.com.cn/settings/logout",
            type: "GET",
            data:{
            
            },
            success:function(resp){
                if(resp.result==="success"){
                    location.reload();
                }
            },
        });
    }

    register_on_remote(){
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app1281.acapp.acwing.com.cn/settings/register",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success:function(resp){
                if(resp.result==="success"){
                    location.reload();
                }else{
                    outer.$register_error_message.html(resp.result);
                }
            },
        });
    }

    login_on_remote(){
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();
        
        $.ajax({
            url: "//app1281.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success:function(resp){
                if(resp.result === "success"){
                    location.reload();
                }else{
                    outer.$login_error_message.html(resp.result);
                }
            },
        });

    }
    login(){
        this.$register.hide();
        this.$login.show();
    }
    register(){
        this.$login.hide();
        this.$register.show();
    }
    getinfo_acapp(){
        let outer = this;
        $.ajax({
            url: "https://app1281.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success:function(resp){
                if(resp.result === "success"){
                    outer.acapp_login(resp.appid,resp.redirect_uri,resp.scope,resp.state);
                }
            },
        });
    }
    acapp_login(appid,redirect_uri,scope,state){
        let outer = this;
        this.root.AcwingOS.api.oauth2.authorize(appid, redirect_uri, scope, state,function(resp){
            if(resp.result === "success"){
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }else{
            }
        });
    
    }
    getinfo_web(){
        let outer = this;
        $.ajax({
            url: "https://app1281.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success:function(resp){
                if(resp.result === "success"){
                    outer.username = resp.username;
                    outer.photo = resp.photo,
                    outer.hide();
                    outer.root.menu.show();
                }else{
                    outer.login();
                }
            },
        });
    }
    hide(){
        this.$settings.hide();
    }
    show(){
        this.$settings.show();
    }
}
export class MyGame{
    constructor(id,AcwingOS){
        this.id=id;
        this.AcwingOS=AcwingOS;
        this.$my_game = $('#'+this.id);
        this.settings =new Settings(this);
        this.menu = new MyGameMenu(this);
        this.playground = new MyGamePlayground(this);
        this.start();
    }
    start(){

    }

}
