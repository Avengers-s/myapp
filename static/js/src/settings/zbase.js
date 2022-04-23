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
