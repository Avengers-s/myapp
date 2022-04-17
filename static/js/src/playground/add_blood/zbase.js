class Add_Blood extends MyGameObject{
    constructor(playground, x, y, value){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.value = value;
        this.alive_time = 30;
        this.eps = 0.01;
    }

    update(){
        this.alive_time -= this.timedelta / 1000;
        this.alive_time = Math.max(this.alive_time,0);
        if(this.alive_time < this.eps)this.destroy();
        this.render();
    }
    on_destroy(){
        for(let i=0;i<this.playground.players.length;i++){
            let player = this.playground.players[i];
            if(player.character === "me"){
                for(let j=0;j<player.add_blood_list.length;j++){
                    if(player.add_blood_list[j].uuid === this.uuid){
                        this.playground.players[i].add_blood_list.splice(j,1);
                    }
                }
            }
        }
    } 
    get_pos_x(x){
        return (x - this.playground.cx)* this.playground.scale;
    }

    get_pos_y(y){
        return (y - this.playground.cy) * this.playground.scale;
    }
    render(){
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(this.get_pos_x(this.x),this.get_pos_y(this.y - this.playground.height * 0.04 / this.playground.scale));
        this.ctx.lineTo(this.get_pos_x(this.x),this.get_pos_y(this.y + this.playground.height * 0.04 / this.playground.scale));
        this.ctx.lineWidth = 8;
        this.ctx.strokeStyle = "green";
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(this.get_pos_x(this.x - this.playground.height * 0.04 / this.playground.scale),this.get_pos_y(this.y));
        this.ctx.lineTo(this.get_pos_x(this.x + this.playground.height * 0.04 / this.playground.scale),this.get_pos_y(this.y));
        this.ctx.lineWidth = 8;
        this.ctx.strokeStyle = "green";
        this.ctx.stroke();
        this.ctx.restore();
    }
}
