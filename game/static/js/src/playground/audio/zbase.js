class Audio{
    constructor(playground){
        this.playground = playground;
        this.$bgm = $(`<audio src="https://app1281.acapp.acwing.com.cn/static/audio/bg.mp3" autoplay='autoplay' loop='loop'></audio>`);
        this.playground.$playground.append(this.$bgm);
    }
}
