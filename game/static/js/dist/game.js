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
                        设置
                    </div>
                </div>
            </div>
        `);
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
        });
    }
    hide(){
        this.$menu.hide();
    }
    show(){
        this.$menu.show();
    }
}
class MyGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div>游戏</div>`);
        this.hide();
        this.root.$my_game.append(this.$playground);
        this.start();
    }
    start(){

    }
    show(){
        this.$playground.show();
    }
    hide(){
        this.$playground.hide();
    }
}
class MyGame{
    constructor(id){
        this.id=id;
        this.$my_game = $('#'+this.id)
        this.menu = new MyGameMenu(this);
        this.playground = new MyGamePlayground(this);
        this.start();
    }
    start(){

    }

}
