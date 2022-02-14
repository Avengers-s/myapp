class Grid extends MyGameObject{
    constructor(playground, x, y, r){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.r = r;
    }
    start(){

    }

    update(){
        this.render();
    }

    render(){
        let w = this.playground.virtual_width / 32;
        let h = this.playground.virtual_height / 18;
        let r = 18, c = 32;
        for(let i = 0;i < r ; i++){
            for(let j=0; j<c; j++){
                let cx = j * w, cy = i * h;
                let color = "rgba(60,60,60,0.5)";
                this.ctx.fillStyle = color;
                this.ctx.fillRect((cx - this.playground.cx) * this.playground.scale, (cy - this.playground.cy) * this.playground.scale, w * this.playground.scale, h *this.playground.scale);
                this.ctx.strokeStyle = "rgba(60, 60, 60, 0.5)";
                this.ctx.lineWidth = 0.005 * this.playground.scale;
                this.ctx.strokeRect((cx - this.playground.cx) * this.playground.scale, (cy - this.playground.cy) * this.playground.scale, w * this.playground.scale, h * this.playground.scale);

            }
        }
    }
}
