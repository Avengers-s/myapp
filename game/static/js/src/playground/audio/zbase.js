class Audio{
    constructor(playground){
        this.playground = playground;
        this.$bgm = $(`<audio src="https://wishball.dylolorz.cn/static/audio/bg.mp3" autoplay='autoplay' loop='loop'></audio>`);
        this.playground.$playground.append(this.$bgm);
    }
}
