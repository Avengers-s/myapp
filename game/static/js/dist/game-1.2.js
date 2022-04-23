class MyGameRank{
    constructor(root){
        this.root = root;
        this.$rank = $(`
            <div class="my_game_rank">
                
                <div class="my_game_rank_field">
                    <div class="my_game_rank_field_item my_game_rank_field_item_return">
                        返回
                    </div>
                    <table class="my_game_rank_field_item my_game_rank_field_item_table table table-hover table-bordered" border=1>
                        <tr>
                            <th>排名</th>
                            <th>用户名</th>
                            <th>积分</th>
                        </tr>
                        <tbody class="my_game_rank_field_item_table_content">
                            <tr>
                                <td>1</td>
                                <td>小红</td>
                                <td>1500</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <br>
                    
                </div>
            </div>
        `);
        this.hide();
        this.root.$my_game.append(this.$rank);
        this.$rank_return = this.$rank.find(".my_game_rank_field_item_return");
        this.$table_content = this.$rank.find(".my_game_rank_field_item_table_content");
        this.start();
    }
    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        let outer = this;
        this.$rank_return.click(function(){
            outer.hide();
            outer.root.menu.show();
        });
    }

    hide(){
        this.$rank.hide();
    }

    show(page){
        this.$table_content.empty();
        let outer = this;
        let page_num = 5;
        let l = page_num * (page - 1) + 1;
        let r = l + page_num - 1;
        $.ajax({
            url: "https://wishball.dylolorz.cn/rank/get_rank",
            type: "GET",
            data:{
                l: l,
                r: r,
            },
            success:function(resp){
                if(resp.result==="success"){
                    let players = resp.rank_list;
                    for(let i=0;i<players.length;i++){
                        let player = players[i];
                        let obj = "<tr><td>"+(l+i)+"</td><td>"+player.username+"</td><td>"+player.score+"</td></tr>";
                        outer.$table_content.append(obj);
                    }
                }
            },
        });
        this.$rank.show();
    }
}
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
                    <div class="my_game_menu_field_item my_game_menu_field_item_rank">
                        排行榜
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
        this.$rank = this.$menu.find(".my_game_menu_field_item_rank");
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
        this.$rank.click(function(){
            outer.hide();
            outer.root.rank.show(1);
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
class Add_Blood extends MyGameObject{
    constructor(playground, x, y, value){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.value = value;
        this.alive_time = 30;
        this.eps = 0.01;
    }

    update(){
        this.alive_time -= this.timedelta / 1000;
        this.alive_time = Math.max(this.alive_time,0);
        if(this.alive_time < this.eps)this.destroy();
        this.render();
    }
    on_destroy(){
        for(let i=0;i<this.playground.players.length;i++){
            let player = this.playground.players[i];
            if(player.character === "me"){
                for(let j=0;j<player.add_blood_list.length;j++){
                    if(player.add_blood_list[j].uuid === this.uuid){
                        this.playground.players[i].add_blood_list.splice(j,1);
                    }
                }
            }
        }
    } 
    get_pos_x(x){
        return (x - this.playground.cx)* this.playground.scale;
    }

    get_pos_y(y){
        return (y - this.playground.cy) * this.playground.scale;
    }
    render(){
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(this.get_pos_x(this.x),this.get_pos_y(this.y - this.playground.height * 0.04 / this.playground.scale));
        this.ctx.lineTo(this.get_pos_x(this.x),this.get_pos_y(this.y + this.playground.height * 0.04 / this.playground.scale));
        this.ctx.lineWidth = 8;
        this.ctx.strokeStyle = "green";
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(this.get_pos_x(this.x - this.playground.height * 0.04 / this.playground.scale),this.get_pos_y(this.y));
        this.ctx.lineTo(this.get_pos_x(this.x + this.playground.height * 0.04 / this.playground.scale),this.get_pos_y(this.y));
        this.ctx.lineWidth = 8;
        this.ctx.strokeStyle = "green";
        this.ctx.stroke();
        this.ctx.restore();
    }
}
class Audio{
    constructor(playground){
        this.playground = playground;
        this.$bgm = $(`<audio src="https://wishball.dylolorz.cn/static/audio/bg.mp3" autoplay='autoplay' loop='loop'></audio>`);
        this.playground.$playground.append(this.$bgm);
    }
}
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
        this.$canvas = $(`<canvas tabindex=0 class="playground_canvas"></canvas>`);
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
class Mini_Map extends MyGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas class="playground_mini_map" tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        //this.ctx = this.playground.game_map.ctx;
        this.p = 3.5;//缩小比例
        this.width = this.playground.width / this.p;
        this.height = this.playground.height / this.p;
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;
        this.playground.$playground.append(this.$canvas);
        this.eps = 0.01;
    }

    start(){
    }

    resize(){
        this.width = this.playground.width / this.p;
        this.height = this.playground.height / this.p;
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;
        this.$canvas.css({
            "position": "absolute",
            "left": (this.playground.$playground.width() - this.playground.width) / 2,
            "bottom": (this.playground.$playground.height() - this.playground.height) / 2 + this.playground.height - this.height,
            "user-select": "none",
        });


    }

    update(){
        this.render();
    }

    render(){
        this.ctx.save();
        this.ctx.fillStyle="rgba(0,0,0,1)";
        this.ctx.fillRect(0,0,this.width, this.height);
        this.ctx.strokeStyle = "rgba(0,0,0,1)";
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
        this.render_add_blood();
        if(this.playground.ring.radius > this.eps)this.render_ring();
        if(this.playground.ring.mini_radius > this.eps) this.render_small_ring();
    }
    get_pos_x(x){                                                                                                                                           
        return x * this.playground.scale;
    }

    get_pos_y(y){
        return y * this.playground.scale;
    }

    render_add_blood(){
        for(let i=0;i<this.playground.players.length;i++){
            let player = this.playground.players[i];
            if(player.character === "me")
            {
                for(let j=0;j<player.add_blood_list.length;j++){
                    let add_blood = player.add_blood_list[j];
                    let x = add_blood.x / this.playground.p / this.p;
                    let y = add_blood.y / this.playground.p / this.p;
                    let len = this.playground.height * 0.04 / this.playground.scale / this.playground.p /this.p;
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.get_pos_x(x),this.get_pos_y(y-len));
                    this.ctx.lineTo(this.get_pos_x(x),this.get_pos_y(y+len));
                    this.ctx.lineWidth = 8;
                    this.ctx.strokeStyle = "green";
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.get_pos_x(x-len),this.get_pos_y(y));
                    this.ctx.lineTo(this.get_pos_x(x+len),this.get_pos_y(y));
                    this.ctx.lineWidth = 8;
                    this.ctx.strokeStyle = "green";
                    this.ctx.stroke();
                    this.ctx.restore();   
                }
            }
        }
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
    render_ring(){
        let x= this.playground.ring.x / this.playground.p / this.p;
        let y = this.playground.ring.y / this.playground.p /this.p;
        let radius = this.playground.ring.radius / this.playground.p / this.p;
        if(radius < this.eps) return false;
        this.ctx.save();
        this.ctx.beginPath();
        if(this.playground.ring.big_ring_state === "reducing")this.ctx.strokeStyle = "red";
        else this.ctx.strokeStyle = "white";
        this.ctx.arc(x * this.playground.scale, y*this.playground.scale, radius * this.playground.scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.restore();
    }
    render_small_ring(){
        if(this.playground.ring.coldtime > this.eps) return false;
        let x = this.playground.ring.mini_x / this.playground.p / this.p;
        let y =this.playground.ring.mini_y / this.playground.p /this.p;
        let radius = this.playground.ring.mini_radius / this.playground.p /this.p;
        if(this.playground.ring.mini_radius < this.eps)return false;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = "white";
        this.ctx.arc(x * this.playground.scale, y * this.playground.scale, radius * this.playground.scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.restore();
    }
}
class NoticeBoard extends MyGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text="已就绪:0人";
        this.ring_state = "距离安全区刷新还有:0秒";
        this.eps = 0.01;
        this.ring_state_code = 0;
    }
    start(){

    }
    write(text){
        this.text = text;
    }
    update(){
        this.update_ring_state();
        this.render();
    }

    update_ring_state(){
        if(this.playground.state !== "fighting") return false;
        if(this.playground.ring.radius < this.eps){
            this.ring_state = "安全区已消失...";
            return false;
        }
        if(this.playground.ring.big_ring_state === "reducing"){
            this.ring_state = "毒圈正在缩小...";
            this.ring_state_code = 0;
            return false;
        }
        
        if(this.ring_state_code === 0 && this.playground.ring.coldtime > this.eps){
            if(this.playground.ring.mini_radius > this.eps)this.ring_state = "距离安全区刷新还有:" + Math.ceil(this.playground.ring.coldtime) + "秒";
            else this.ring_state = "安全区已消失...";
        }else{
            if(this.ring_state_code === 0){
                this.ring_state_code = 1;
            }else{
                if(this.playground.ring.big_coldtime > this.eps)this.ring_state = "距离毒圈缩小还有:" + Math.floor(this.playground.ring.big_coldtime) + "秒";
                else this.ring_state_code = 0;
            }
        }
    }

    render(){
        this.render_text();
        if(this.playground.state === "fighting")this.render_ring_text();
    }
    render_text(){
        this.ctx.save();
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width/2, 20); 
        this.ctx.restore();
    }
    render_ring_text(){
        this.ctx.save();
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.ring_state, this.playground.width/2 , 50);
        this.ctx.restore();
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
        this.reduce_speed_time = 0;
        this.spent_time=0;
        this.fireballs = [];
        this.hp = 100;
        this.iceballs = [];
        this.in_ring_state = false;
        this.in_ring_time = 1;
        this.real_in_ring_time = 1;
        if(this.character !== "robot"){
            this.img = new Image();
            this.img.src = this.photo;
        }
        if(this.character === "me"){
            this.tot_add_blood = 0;
            this.add_blood_list = [];
            this.fireball_coldtime = 0.01;
            this.fireball_real_coldtime = 0.01;
            this.fireball_img = new Image();
            this.fireball_img.src= "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.blink_coldtime = 4;
            this.blink_real_coldtime = 4;
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";

            this.iceball_coldtime = 0.01;
            this.iceball_real_coldtime = 0.01;
        }

    }
    start(){
        this.playground.player_count++;
        this.playground.notice_board.write("已就绪:"+this.playground.player_count+"人");
        if(this.playground.player_count>=3){
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting" + "("+ this.playground.players.length + "/" + this.playground.player_count + ")");
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
        this.playground.mini_map.$canvas.on("contextmenu",function(){
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
                        outer.fireball_coldtime= outer.fireball_real_coldtime;
                        outer.cur_skill = null;
                        if(outer.playground.mode === "multi mode"){
                            outer.playground.mps.send_shoot_fireball(tx,ty,fireball.uuid);
                        }
                    }else if(outer.cur_skill === "blink"){
                        tx += outer.playground.cx;
                        ty += outer.playground.cy;
                        outer.blink(tx,ty);
                        outer.cur_skill = null;
                        outer.blink_coldtime = outer.blink_real_coldtime;
                        if(outer.playground.mode === "multi mode"){
                            outer.playground.mps.send_blink(tx,ty);
                        }

                    }else if(outer.cur_skill === "iceball"){
                        tx += outer.playground.cx;
                        ty += outer.playground.cy;
                        let iceball = outer.shoot_iceball(tx,ty);
                        outer.iceball_coldtime = outer.iceball_real_coldtime;
                        outer.cur_skill = null;
                        if(outer.playground.mode === "multi mode"){
                            outer.playground.mps.send_shoot_iceball(tx, ty, iceball.uuid);
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
                if(e.which === 81){//q
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
                }else if(e.which === 87){//w
                    if(outer.iceball_coldtime > outer.eps){
                        return true;
                    }
                    outer.cur_skill = "iceball";
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
            let move_length = this.playground.height *0.09 *Math.random();
            new Particle(this.playground,this, x, y, vx, vy, radius/this.playground.scale, color, speed/this.playground.scale, move_length/this.playground.scale);
        }
    }

    shoot_fireball(tx, ty){
        let angle = Math.atan2(ty-this.y, tx-this.x);
        let vx=Math.cos(angle);
        let vy=Math.sin(angle);
        let fireball = new FireBall(this.playground, this, this.x, this.y, this.playground.height*0.01/this.playground.scale,vx,vy,this.playground.height*0.5/this.playground.scale,this.playground.height/this.playground.scale,"orange",10);
        this.fireballs.push(fireball);
        return fireball;
    }

    shoot_iceball(tx,ty){
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let radius = this.playground.height*0.015/this.playground.scale;
        let speed = this.playground.height * 0.5 /this.playground.scale;
        let move_length = this.playground.height / this.playground.scale;
        let color = "white";
        let iceball = new Ice_Ball(this.playground, this, this.x + this.radius * vx, this.y + this.radius * vy, radius, vx, vy, speed, move_length, color, 5);
        this.iceballs.push(iceball);
        return iceball;
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

    is_attack(angle,damage,tp){
        if(tp === "fireball") this.is_attack_fireball(angle,damage);
        else if(tp === "iceball") this.is_attack_iceball(angle,damage);
    }

    is_attack_iceball(angle,damage){
        for(let i=0;i<20+Math.random()*15;i++){
            let x=this.x,y=this.y;
            let radius = this.radius*Math.random()*0.13;
            let angle = Math.PI * 2* Math.random();
            let vx=Math.cos(angle),vy=Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 6;
            let move_length = this.radius * Math.random() * 7;
            new Particle(this.playground, this, x, y, vx, vy, radius, color, speed ,move_length);
        }
        // this.radius -= damage;
        this.hp -= damage;
        if(this.hp < this.eps){
            this.destroy();
            return false;
        }
        this.damage_vx=Math.cos(angle);
        this.damage_vy=Math.sin(angle);
        this.damage_speed = this.playground.height  / this.playground.scale;
        this.reduce_speed_time = 3;


    }
    is_attack_fireball(angle,damage){
        if(this.playground.mode === "single mode")new Effects(this.playground,this);
        for(let i=0;i<20+Math.random()*15;i++){
            let x=this.x,y=this.y;
            let radius = this.radius*Math.random()*0.13;
            let angle = Math.PI * 2* Math.random();
            let vx=Math.cos(angle),vy=Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 6;
            let move_length = this.radius * Math.random() * 7;
            new Particle(this.playground, this, x, y, vx, vy, radius, color, speed ,move_length);
        }
        // this.radius -= damage;
        this.hp -= damage;
        if(this.hp < this.eps){
            this.destroy();
            return false;
        }
        this.damage_vx=Math.cos(angle);
        this.damage_vy=Math.sin(angle);
        this.damage_speed = this.playground.height  / this.playground.scale;
    }

    destroy_fireball(uuid){
        for(let i=0;i<this.fireballs.length;i++){
            let fireball = this.fireballs[i];
            if(fireball.uuid === uuid){
                fireball.destroy();
                break;
            }
        }
    }

    destroy_iceball(uuid){
        for(let i =0;i<this.iceballs.length;i++){
            let iceball = this.iceballs[i];
            if(iceball.uuid === uuid){
                iceball.destroy();
                break;
            }
        }
    }
    receive_attack(x,y,angle,damage,ball_uuid,attacker,attack_type){
        if(attack_type === "fireball")attacker.destroy_fireball(ball_uuid);
        else if(attack_type === "iceball") attacker.destroy_iceball(ball_uuid);
        this.x=x;
        this.y=y;
        this.is_attack(angle,damage,attack_type);
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
    update_add_blood(){
        if(this.character === "me" && this.add_blood_list.length < 4 && Math.random()< 1.0/800){
            let new_add_blood = new Add_Blood(this.playground, this.playground.virtual_width * Math.random(), this.playground.virtual_height * Math.random(), 10);
            this.add_blood_list.push(new_add_blood);
        }
        if(this.character === "me"){
            for(let j=0;j<this.add_blood_list.length;j++){
                let li = this.add_blood_list[j];
                console.log(li.x,li.y,this.x,this.y);
                //console.log(this.get_dist(li.x,li.y,this.x,this.y));
                if(this.get_dist(li.x,li.y,this.x,this.y) < this.radius){
                    li.destroy();
                    this.hp+=10;
                    this.hp=Math.min(this.hp,100);
                }
            }
        }
    }
    update(){
        if(this.playground.mode === "single mode")this.update_add_blood();
        this.spent_time+=this.timedelta/1000;
        if(this.character === "robot" && this.spent_time > 3 && Math.random() < 1.0/300){
            let player = this.playground.players[Math.floor(Math.random()*this.playground.players.length)];
            let tx = player.x+player.vx*player.speed*0.2;
            let ty = player.y+player.vy*player.speed*0.2;
            this.shoot_fireball(tx,ty);
        }else if(this.character === "robot" && this.spent_time > 3 && Math.random() < 1/400){
            let player = this.playground.players[Math.floor(Math.random()*this.playground.players.length)];
            let tx = player.x+player.vx*player.speed*0.2;
            let ty = player.y+player.vy*player.speed*0.2;
            this.shoot_iceball(tx,ty);
        }
        this.update_win();
        this.update_move();
        if(this.character === "me" && this.playground.state === "fighting"){
            this.update_skill_coldtime();
        }
        this.update_debuff();
        this.update_map_view();
        if(this.character !== "enemy")this.update_ring();
        this.update_notice_board();
        this.render();
    }

    update_ring(){
        if(this.playground.ring.radius < this.eps || this.get_dist(this.x,this.y,this.playground.ring.x,this.playground.ring.y) > this.playground.ring.radius){
            this.in_ring_state = true;
        }else{
            this.in_ring_state = false;
            this.in_ring_time = this.real_in_ring_time;
        }

        if(this.in_ring_state){
            this.in_ring_time -= this.timedelta / 1000;
            this.in_ring_time = Math.max(0,this.in_ring_time);
        }

        if(this.in_ring_time < this.eps){
            this.in_ring_time = this.real_in_ring_time;
            this.hp -= 5;
            if(this.playground.mode === "multi mode" && this.playground.state === "fighting")this.playground.mps.send_is_in_ring();
            if(this.hp < this.eps){
                this.destroy();
                return false;
            }
        }
    }
    update_notice_board(){
        if(this.playground.state === "fighting")this.playground.notice_board.write("Fighting" + "("+ this.playground.players.length + "/" + this.playground.player_count + ")");
    }


    update_debuff(){
        this.reduce_speed_time -= this.timedelta / 1000;
        this.reduce_speed_time = Math.max(0,this.reduce_speed_time);
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
                let moved = 0;
                if(this.reduce_speed_time < this.eps)moved = Math.min(this.move_length,this.speed*this.timedelta/1000);
                else moved = Math.min(this.move_length,this.speed*0.5*this.timedelta / 1000);
                this.x+=this.vx*moved;
                this.y+=this.vy*moved;
                this.move_length-=moved;
            }else{
                if(this.character !== "robot"){
                    this.vx=this.vy=0;
                    this.move_length=0;
                }else{
                    if(Math.random() < 1/10 || this.playground.ring.radius < this.eps)this.move_to(this.playground.virtual_width * Math.random(),this.playground.virtual_height * Math.random());
                    else this.move_to(Math.min(this.playground.virtual_width,this.playground.ring.mini_x +( Math.random() * 2 -1)*this.playground.ring.mini_radius), Math.min(this.playground.virtual_height,this.playground.ring.mini_y+(Math.random()* 2 -1)*this.playground.ring.mini_radius));
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
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc((this.x - this.playground.cx )*this.playground.scale,(this.y - this.playground.cy )*this.playground.scale,this.radius*this.playground.scale,0,Math.PI *2,false);
            this.ctx.fillStyle=this.color;
            this.ctx.fill();
            this.ctx.restore();
        }

        if(this.character === "me" && this.playground.state === "fighting"){
            this.render_skill_coldtime();
        }

        this.render_blood();
        this.render_debuff();
    }

    render_debuff(){
        if(this.reduce_speed_time > this.eps){
            if(this.move_length > this.eps){
                for(let i = 1 ;i<=20;i++){
                    let moved = this.radius + this.radius * Math.random();
                    let x = this.x - moved * this.vx - this.radius * this.vy;
                    let y = this.y - moved * this.vy - this.radius * this.vx;
                    for(let j=0;j<=2*this.radius;j+= this.radius * 1/10){
                        let radius = this.radius* Math.random()*0.1;
                        x += this.radius * 1/10 * this.vy;
                        y += this.radius * 1/10 * this.vx;
                        this.ctx.save();
                        this.ctx.beginPath();
                        this.ctx.arc((x - this.playground.cx )*this.playground.scale,(y - this.playground.cy )*this.playground.scale,radius*this.playground.scale,0,Math.PI *2,false);
                        this.ctx.fillStyle= "white";
                        this.ctx.fill();
                        this.ctx.restore();

                    }
                }
            }
        }
    }

    render_blood(){
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = 0.007 * this.playground.scale;
        this.ctx.strokeStyle = "green";
        if(this.hp < 50)this.ctx.strokeStyle = "red";
        if (this.hp === 100){
            this.ctx.arc((this.x - this.playground.cx) * this.playground.scale, (this.y - this.playground.cy) * this.playground.scale , this.radius * 1.4 * this.playground.scale, 0, Math.PI * 2 * (this.hp / 100), false);
        }
        else{
            this.ctx.arc((this.x - this.playground.cx) * this.playground.scale, (this.y - this.playground.cy) * this.playground.scale , this.radius * 1.4 * this.playground.scale, 0 - Math.PI / 2 , Math.PI * 2 * (1 - this.hp / 100) - Math.PI /2, true);
        }
        this.ctx.stroke();
        this.ctx.restore();
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
            this.ctx.arc(x*this.playground.scale,y*this.playground.scale,r*this.playground.scale,0-Math.PI/2,Math.PI *2*(1-this.fireball_coldtime/ this.fireball_real_coldtime )-Math.PI/2,true);
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
            this.ctx.arc(x*this.playground.scale,y*this.playground.scale,r*this.playground.scale,0-Math.PI/2,Math.PI *2*(1-this.blink_coldtime/this.blink_real_coldtime )-Math.PI/2,true);
            this.ctx.lineTo(x*this.playground.scale,y*this.playground.scale);
            this.ctx.fillStyle="rgba(0,0,255,0.6)";
            this.ctx.fill();
        }


    }

}
class Ring extends MyGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = this.playground.virtual_width / 2;
        this.y = this.playground.virtual_height / 2;
        this.radius = Math.sqrt( this.x * this.x + this.y * this.y );
        this.mini_radius = Math.min(this.playground.virtual_height /2,this.radius * ( 2 / 3 ));
        this.mini_x = (this.playground.virtual_width - 2*this.mini_radius) * Math.random() + this.mini_radius;
        this.mini_y = (this.playground.virtual_height - 2*this.mini_radius ) * Math.random() + this.mini_radius;
        this.max_radius = this.radius;
        this.eps = 0.01;
        this.speed = 1 / 20 * this.max_radius;
        this.big_ring_state = "waiting";
        this.coldtime = 10;
        this.real_coldtime = 10;
        this.big_coldtime = 15;
        this.big_real_coldtime = 15;
        this.last_flag = -1;
    }
    start(){
        //send(this.mini_radius,mini_x,mini_y)
        
    }
    get_dist(x1,y1,x2,y2){
        let x= x2 - x1;
        let y = y2 - y1;
        return Math.sqrt(x*x + y*y);
    }
    update(){
        if(this.last_flag !== this.mini_radius && this.playground.mode === "multi mode" && this.playground.state === "fighting"){
            this.playground.mps.send_sync_ring(this.mini_radius,this.mini_x,this.mini_y,this.coldtime,this.big_coldtime,this.big_ring_state);
            this.last_flag = this.mini_radius;
        }
        if(this.playground.state !== "fighting") return false;
        this.update_coldtime();
        this.update_big_ring();
        this.update_small_ring();
        if(this.radius > this.eps)this.render();
    }

    update_coldtime(){
        this.coldtime -= this.timedelta / 1000;
        this.coldtime = Math.max(this.coldtime , 0);
        if(this.coldtime < this.eps)this.big_coldtime -= this.timedelta /1000;
        this.big_coldtime = Math.max(this.big_coldtime,0);
    }

    update_big_ring(){
        //this.radius -= (1/10 * this.max_radius) * this.timedelta / 1000;
        //console.log(this.big_coldtime);
        if(this.big_coldtime > this.eps) return false;
        this.big_ring_state = "reducing";
        if(this.mini_radius < this.eps){
            this.radius -= this.speed * this.timedelta / 1000;
        }else{
            let dist = this.get_dist(this.mini_x,this.mini_y, this.x, this.y);
            if(this.radius > dist + this.mini_radius){
                this.radius -= this.speed * this.timedelta / 1000;
            }else{
                if((this.radius - this.mini_radius)< this.eps * 0.1){
                    this.coldtime = this.real_coldtime ;
                    this.big_coldtime = this.big_real_coldtime;
                    this.big_ring_state = "waiting";
                    this.mini_radius -= this.radius * (1/ 2);
                    if(this.mini_radius < this.max_radius * 1/10)this.mini_radius =0;
                    this.mini_x += (Math.random() * 2 - 1) * (this.radius - this.mini_radius);
                    this.mini_y += (Math.random() * 2 - 1) * (this.radius - this.mini_radius);
                    //send(mini_radius,mini_x,mini_y);
                    return false;
                }
                let angle = Math.atan2(this.mini_y - this.y , this.mini_x  - this.x);
                let vx = Math.cos(angle);
                let vy = Math.sin(angle);
                this.x += vx * this.speed * this.timedelta /1000;
                //this.x +=vx * this.speed * this.timedelta /1000;
                //this.y -= vy * this.speed * this.timedelta / 1000;
                this.y += vy *this.speed *this.timedelta / 1000;
                this.radius = this.get_dist (this.x,this.y , this.mini_x,this.mini_y) + this.mini_radius;
            }
        }
    }

    update_small_ring(){
    
    }

    render(){
        this.render_small_ring();
        this.render_big_ring();
       
    }

    render_big_ring(){
        this.ctx.save();
        this.ctx.beginPath();
        if(this.big_ring_state !== "waiting")this.ctx.strokeStyle = "red";
        else this.ctx.strokeStyle = "white";
        this.ctx.arc((this.x - this.playground.cx) * this.playground.scale, (this.y - this.playground.cy) * this.playground.scale, this.radius * this.playground.scale , 0, Math.PI * 2 ,false);
        this.ctx.stroke();
        this.ctx.restore();
    }

    render_small_ring(){
        if(this.coldtime > this.eps || this.mini_radius < this.eps)return false;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = "white";
        this.ctx.arc((this.mini_x - this.playground.cx) * this.playground.scale, (this.mini_y - this.playground.cy) * this.playground.scale, this.mini_radius * this.playground.scale , 0, Math.PI * 2 ,false);
        this.ctx.stroke();
        this.ctx.restore();
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
        $.ajax({
            url: "https://wishball.dylolorz.cn/playground/update_score",
            type: "GET",
            data: {
                username: outer.playground.root.settings.username,
                score: "10",
            },
            success: function(resp){
                if(resp.result==="successs"){

                }
            },
        });
        setTimeout(function(){
            outer.add_listening_events();
        }, 1000);
    }

    lose(){
        this.state = "lose";
        let outer = this;
        $.ajax({
            url: "https://wishball.dylolorz.cn/playground/update_score",
            type: "GET",
            data: {
                username: outer.playground.root.settings.username,
                score: "-5",
            },
            success: function(resp){
                if(resp.result==="successs"){

                }
            },
        });
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
                    player.is_attack(angle,this.damage, "fireball");
                    if(this.playground.mode === "multi mode"){
                        this.playground.mps.send_attack(player.uuid,player.x,player.y,angle,this.damage,this.uuid,"fireball");
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
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc((this.x - this.playground.cx)*this.playground.scale,(this.y - this.playground.cy) * this.playground.scale,this.radius*this.playground.scale,0,Math.PI *2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
        this.ctx.restore();
    }
}
class Ice_Ball extends MyGameObject{
    constructor(playground, player, x, y, radius, vx, vy, speed, move_length, color, damage){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.x = x;
        this.y = y ;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.move_length = move_length;
        this.color = color;
        this.damage = damage;
        this.eps = 0.01;
    }
    start(){
        
    }
    get_dist(x1, y1, x2, y2){
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player){
        let dist = this.get_dist(this.x, this.y, player.x, player.y);
        if(dist < this.radius + player.radius){
            return true;
        }
    }

    update(){
        if(this.player.character !== "enemy"){
            this.update_attack();
        }
        this.update_move();
        this.render();
    }

    update_attack(){
        for(let i =0;i<this.playground.players.length;i++){
            let player = this.playground.players[i];
            if(player != this.player){
                if(this.is_collision(player)){
                    let angle = Math.atan2(player.y - this.y, player.x - this.x);
                    player.is_attack(angle, this.damage, "iceball");
                    if(this.playground.mode === "multi mode"){
                        this.playground.mps.send_attack(player.uuid,player.x,player.y, angle , this.damage, this.uuid, "iceball");
                    }
                    this.destroy();
                    return false;
                }
            }
        }
    }

    on_destroy(){
        let iceballs = this.player.iceballs;
        for(let i=0;i<iceballs.length;i++){
            let iceball = iceballs[i];
            if(iceball.uuid === this.uuid){
                iceballs.splice(i,1);
                break;
            }
        }
    }

    update_move(){
        if(this.move_length < this.eps){
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += moved*this.vx;
        this.y +=moved * this.vy;
    }

    render(){
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc((this.x - this.playground.cx) * this.playground.scale,(this.y - this.playground.cy) * this.playground.scale, this.radius * this.playground.scale, 0,Math.PI*2,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.restore();
    }
}
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
class MyGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="my_game_playground"></div>`);
        this.hide();
        this.player_count=0;
        this.chat_state = 0;
        this.cx = 0;
        this.cy = 0;
        this.robot_number = 15;
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
        this.p = 3;
        this.virtual_width = this.width / this.scale * this.p;
        this.virtual_height = this.p;
        this.cx = this.virtual_width / 2 - this.width / 2 / this.scale;
        this.cy = this.virtual_height / 2 - this.height / 2 / this.scale;
        if(this.game_map)this.game_map.resize();
        if(this.mini_map)this.mini_map.resize();
    }
    show(mode){
        this.$playground.show();
        this.resize();
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.bgm = new Audio(this);
        this.game_map = new Game_Map(this);
        this.grid = new Grid(this);
        this.notice_board = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.ring = new Ring(this);
        this.player_count = 0;
        this.state = "waiting"; //waiting -> fighting -> over
        this.resize();
        this.players = [];
        this.mode=mode;
        this.players.push(new Player(this,this.virtual_width / 2,this.virtual_height / 2,this.height*0.05/this.scale,"white",this.height*0.15/this.scale,"me",this.root.settings.username,this.root.settings.photo));
        if(mode === "single mode"){
            for(let i=0;i< this.robot_number ;i++){
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
        this.mini_map = new Mini_Map(this);
        this.resize();
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
        if(this.mini_map){
            this.mini_map.destroy();
            this.mini_map = null;
        }
        if(this.ring){
            this.ring.destroy();
            this.ring = null;
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
            <img width="30" src="https://wishball.dylolorz.cn/static/image/settings/aclogo.jpg">
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
            <img width="30" src="https://wishball.dylolorz.cn/static/image/settings/aclogo.jpg">
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
            url: "https://wishball.dylolorz.cn/settings/acwing/web/apply_code/",
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
            url: "https://wishball.dylolorz.cn/settings/logout",
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
            url: "https://wishball.dylolorz.cn/settings/register",
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
            url: "//wishball.dylolorz.cn/settings/login/",
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
            url: "https://wishball.dylolorz.cn/settings/acwing/acapp/apply_code/",
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
            url: "https://wishball.dylolorz.cn/settings/getinfo/",
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
        this.rank = new MyGameRank(this);
        this.start();
    }
    start(){

    }

}
