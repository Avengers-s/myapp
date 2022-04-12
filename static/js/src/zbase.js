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
