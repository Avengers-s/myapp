class Ring extends MyGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = this.playground.virtual_width / 2;
        this.y = this.playground.virtual_height / 2;
        this.radius = Math.sqrt( this.x * this.x + this.y * this.y );
        this.mini_radius = Math.min(this.playground.virtual_height /2,this.radius * ( 2 / 3 ));
        this.mini_x = (this.playground.virtual_width - 2*this.mini_radius) * Math.random() + this.mini_radius;
        this.mini_y = (this.playground.virtual_height - 2*this.mini_radius ) * Math.random() + this.mini_radius;
        this.max_radius = this.radius;
        this.eps = 0.01;
        this.speed = 1 / 20 * this.max_radius;
        this.big_ring_state = "waiting";
        this.coldtime = 10;
        this.real_coldtime = 10;
        this.big_coldtime = 15;
        this.big_real_coldtime = 15;
        this.last_flag = -1;
    }
    start(){
        //send(this.mini_radius,mini_x,mini_y)
        
    }
    get_dist(x1,y1,x2,y2){
        let x= x2 - x1;
        let y = y2 - y1;
        return Math.sqrt(x*x + y*y);
    }
    update(){
        if(this.last_flag !== this.mini_radius && this.playground.mode === "multi mode" && this.playground.state === "fighting"){
            this.playground.mps.send_sync_ring(this.mini_radius,this.mini_x,this.mini_y,this.coldtime,this.big_coldtime,this.big_ring_state);
            this.last_flag = this.mini_radius;
        }
        if(this.playground.state !== "fighting") return false;
        this.update_coldtime();
        this.update_big_ring();
        this.update_small_ring();
        if(this.radius > this.eps)this.render();
    }

    update_coldtime(){
        this.coldtime -= this.timedelta / 1000;
        this.coldtime = Math.max(this.coldtime , 0);
        if(this.coldtime < this.eps)this.big_coldtime -= this.timedelta /1000;
        this.big_coldtime = Math.max(this.big_coldtime,0);
    }

    update_big_ring(){
        //this.radius -= (1/10 * this.max_radius) * this.timedelta / 1000;
        //console.log(this.big_coldtime);
        if(this.big_coldtime > this.eps) return false;
        this.big_ring_state = "reducing";
        if(this.mini_radius < this.eps){
            this.radius -= this.speed * this.timedelta / 1000;
        }else{
            let dist = this.get_dist(this.mini_x,this.mini_y, this.x, this.y);
            if(this.radius > dist + this.mini_radius){
                this.radius -= this.speed * this.timedelta / 1000;
            }else{
                if((this.radius - this.mini_radius)< this.eps * 0.1){
                    this.coldtime = this.real_coldtime ;
                    this.big_coldtime = this.big_real_coldtime;
                    this.big_ring_state = "waiting";
                    this.mini_radius -= this.radius * (1/ 2);
                    if(this.mini_radius < this.max_radius * 1/10)this.mini_radius =0;
                    this.mini_x += (Math.random() * 2 - 1) * (this.radius - this.mini_radius);
                    this.mini_y += (Math.random() * 2 - 1) * (this.radius - this.mini_radius);
                    //send(mini_radius,mini_x,mini_y);
                    return false;
                }
                let angle = Math.atan2(this.mini_y - this.y , this.mini_x  - this.x);
                let vx = Math.cos(angle);
                let vy = Math.sin(angle);
                this.x += vx * this.speed * this.timedelta /1000;
                //this.x +=vx * this.speed * this.timedelta /1000;
                //this.y -= vy * this.speed * this.timedelta / 1000;
                this.y += vy *this.speed *this.timedelta / 1000;
                this.radius = this.get_dist (this.x,this.y , this.mini_x,this.mini_y) + this.mini_radius;
            }
        }
    }

    update_small_ring(){
    
    }

    render(){
        this.render_small_ring();
        this.render_big_ring();
       
    }

    render_big_ring(){
        this.ctx.save();
        this.ctx.beginPath();
        if(this.big_ring_state !== "waiting")this.ctx.strokeStyle = "red";
        else this.ctx.strokeStyle = "white";
        this.ctx.arc((this.x - this.playground.cx) * this.playground.scale, (this.y - this.playground.cy) * this.playground.scale, this.radius * this.playground.scale , 0, Math.PI * 2 ,false);
        this.ctx.stroke();
        this.ctx.restore();
    }

    render_small_ring(){
        if(this.coldtime > this.eps || this.mini_radius < this.eps)return false;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = "white";
        this.ctx.arc((this.mini_x - this.playground.cx) * this.playground.scale, (this.mini_y - this.playground.cy) * this.playground.scale, this.mini_radius * this.playground.scale , 0, Math.PI * 2 ,false);
        this.ctx.stroke();
        this.ctx.restore();
    }
}
