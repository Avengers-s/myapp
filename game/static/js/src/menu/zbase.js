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
                    <div class="my_game_menu_field_item my_game_menu_field_item_alive_mod">
                        生存模式
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
