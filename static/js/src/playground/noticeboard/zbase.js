class NoticeBoard extends MyGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text="已就绪:0人";
        this.ring_state = "距离安全区刷新还有:0秒";
        this.eps = 0.01;
        this.ring_state_code = 0;
    }
    start(){

    }
    write(text){
        this.text = text;
    }
    update(){
        this.update_ring_state();
        this.render();
    }

    update_ring_state(){
        if(this.playground.state !== "fighting") return false;
        if(this.playground.ring.radius < this.eps){
            this.ring_state = "安全区已消失...";
            return false;
        }
        if(this.playground.ring.big_ring_state === "reducing"){
            this.ring_state = "毒圈正在缩小...";
            this.ring_state_code = 0;
            return false;
        }
        
        if(this.ring_state_code === 0 && this.playground.ring.coldtime > this.eps){
            if(this.playground.ring.mini_radius > this.eps)this.ring_state = "距离安全区刷新还有:" + Math.ceil(this.playground.ring.coldtime) + "秒";
            else this.ring_state = "安全区已消失...";
        }else{
            if(this.ring_state_code === 0){
                this.ring_state_code = 1;
            }else{
                if(this.playground.ring.big_coldtime > this.eps)this.ring_state = "距离毒圈缩小还有:" + Math.floor(this.playground.ring.big_coldtime) + "秒";
                else this.ring_state_code = 0;
            }
        }
    }

    render(){
        this.render_text();
        if(this.playground.state === "fighting")this.render_ring_text();
    }
    render_text(){
        this.ctx.save();
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width/2, 20); 
        this.ctx.restore();
    }
    render_ring_text(){
        this.ctx.save();
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.ring_state, this.playground.width/2 , 50);
        this.ctx.restore();
    }
}
