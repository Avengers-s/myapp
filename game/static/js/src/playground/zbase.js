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
