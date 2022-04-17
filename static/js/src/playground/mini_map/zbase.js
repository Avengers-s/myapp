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
