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
            outer.root.playground.show();
        });
        this.$multi_mod.click(function(){
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
    }
    start(){

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
            //console.log("yes");
            obj.timedelta=stamp-last_stamp;
            obj.update();
        }
    }
    last_stamp = stamp;
    requestAnimationFrame(MY_GAME_ANIMATION);
}

requestAnimationFrame(MY_GAME_ANIMATION);
class Game_Map extends MyGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
   
    }

    update(){
        this.render();
    }
    render(){
        this.ctx.fillStyle="rgba(0,0,0,0.2)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
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
        this.eps=0.1;
        this.ctx = this.playground.game_map.ctx;
        this.friction =0.9;
        this.move_length = move_length;
    }
    start(){
        
    }
    update(){
        if(this.speed < 20 || this.move_length < this.eps){
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
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI *2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
    }
}
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
        if(this.is_me){
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }

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
                let rect=outer.ctx.canvas.getBoundingClientRect();
                if(e.which === 3){
                    outer.move_to(e.clientX - rect.left,e.clientY - rect.top);
                    outer.click_effect(e.clientX - rect.left,e.clientY - rect.top);
                }else if(e.which === 1){
                    if(outer.cur_skill === "fireball"){
                        outer.shoot_fireball(e.clientX - rect.left,e.clientY - rect.top);
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
            new Particle(this.playground,this, x, y, vx, vy, radius, color, speed, move_length);
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
            let radius = this.radius*Math.random()*0.06;
            let angle = Math.PI * 2* Math.random();
            let vx=Math.cos(angle),vy=Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 3;
            let move_length = this.radius * Math.random() * 3;
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
        if(this.is_me){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2); 
            this.ctx.restore();
        }
        else{
            this.ctx.beginPath();
            this.ctx.arc(this.x,this.y,this.radius,0,Math.PI *2,false);
            this.ctx.fillStyle=this.color;
            this.ctx.fill();
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
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI *2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
    }
}
class MyGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="my_game_playground"></div>`);
        this.hide();
        this.start();
    }
    get_random_color(){
        let colors=["red","grey","green","pink","yellow","blue","orange"];
            return colors[Math.floor(Math.random()*colors.length)];
    }
    start(){

    }
    show(){
        this.$playground.show();
        this.root.$my_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new Game_Map(this);
        this.players = [];
        this.players.push(new Player(this,this.width/2,this.height/2,this.height*0.05,"white",this.height*0.25,true));
        for(let i=0;i<5;i++){
            this.players.push(new Player(this,this.width/2,this.height/2,this.height*0.05,this.get_random_color(),this.height*0.25,false));
        }
    }
    hide(){
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
                    console.log(resp);
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
                    console.log(resp);
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
                console.log(resp);
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
                    console.log(resp);
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
