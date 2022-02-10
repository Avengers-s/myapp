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
        let outer = this;
        $(window).resize(function(){
            outer.resize();
        });
    }
    resize(){
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width/16,this.height/9);
        this.width = unit*16;
        this.height = unit*9;
        this.scale = this.height;
        if(this.game_map)this.game_map.resize();
    }
    show(mode){
        this.$playground.show();
        this.root.$my_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new Game_Map(this);
        this.resize();
        this.players = [];
        this.players.push(new Player(this,this.width/2/this.scale,this.height/2/this.scale,this.height*0.05/this.scale,"white",this.height*0.25/this.scale,"me",this.root.settings.username,this.root.settings.photo));
        if(mode === "single mode"){
            for(let i=0;i<5;i++){
                this.players.push(new Player(this,this.width/2/this.scale,this.height/2/this.scale,this.height*0.05/this.scale,this.get_random_color(),this.height*0.25/this.scale,"robot"));
            }
        }else{
            let outer = this;
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen=function(){
                outer.mps.send_create_player(outer.root.settings.username,outer.root.settings.photo);
            };
        }
    }
    hide(){
        this.$playground.hide();
    }
}
