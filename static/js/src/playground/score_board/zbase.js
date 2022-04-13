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
            url: "https://app1281.acapp.acwing.com.cn/playground/update_score",
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
            url: "https://app1281.acapp.acwing.com.cn/playground/update_score",
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
