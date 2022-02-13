let my_game_objects = [];
class MyGameObject{
    constructor(){
        my_game_objects.push(this);
        this.has_called_start=false;
        this.timedelta=0;
        this.uuid = this.create_uuid();
    }
    start(){

    }

    last_update(){

    }

    create_uuid(){
        let res="";
        for(let i=0;i<8;i++){
            let x = Math.floor(Math.random()*10);
            res+=x;
        }
        return res;
    }

    update(){

    }

    on_destroy(){
    
    }

    destroy(){
        this.on_destroy();
        for(let i=0; i<my_game_objects.length; i++){
            let obj=my_game_objects[i];
            if(obj === this){
                my_game_objects.splice(i,1);
            }
        }
    }
}

let last_stamp;
let MY_GAME_ANIMATION=function(stamp){
    for(let i=0;i<my_game_objects.length;i++){
        let obj=my_game_objects[i];
        if(!obj.has_called_start){
            obj.has_called_start=true;
            obj.start();
        }else{
            obj.timedelta=stamp-last_stamp;
            obj.update();
        }
    }
    for(let i=0;i<my_game_objects.length;i++){
        let obj = my_game_objects[i];
        obj.last_update();
    }
    last_stamp = stamp;
    requestAnimationFrame(MY_GAME_ANIMATION);
}

requestAnimationFrame(MY_GAME_ANIMATION);
