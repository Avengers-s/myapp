class MyGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="my_game_playground"></div>`);
        this.hide();
        this.player_count=0;
        this.chat_state = 0;
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

        $(window).on(`resize${uuid}`,(function(){
            outer.resize();
        }));

        if(this.root.AcwingOS){
            this.root.AcwingOS.api.window.on_close(function(){
                $(window).off(`resize${uuid}`);
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
        if(this.game_map)this.game_map.resize();
    }
    show(mode){
        this.$playground.show();
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new Game_Map(this);
        this.notice_board = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.player_count = 0;
        this.state = "waiting"; //waiting -> fighting -> over
        this.resize();
        this.players = [];
        this.mode=mode;
        this.players.push(new Player(this,this.width/2/this.scale,this.height/2/this.scale,this.height*0.05/this.scale,"white",this.height*0.25/this.scale,"me",this.root.settings.username,this.root.settings.photo));
        if(mode === "single mode"){
            for(let i=0;i<5;i++){
                this.players.push(new Player(this,this.width/2/this.scale,this.height/2/this.scale,this.height*0.05/this.scale,this.get_random_color(),this.height*0.25/this.scale,"robot"));
            }
        }else{
            let outer = this;
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen=function(){
                outer.mps.send_create_player(outer.root.settings.username,outer.root.settings.photo);
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

        this.$playground.empty();

        this.$playground.hide();
    }
}
