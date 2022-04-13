class MyGameRank{
    constructor(root){
        this.root = root;
        this.$rank = $(`
            <div class="my_game_rank">
                
                <div class="my_game_rank_field">
                    <div class="my_game_rank_field_item my_game_rank_field_item_return">
                        返回
                    </div>
                    <table class="my_game_rank_field_item my_game_rank_field_item_table table table-hover table-bordered" border=1>
                        <tr>
                            <th>排名</th>
                            <th>用户名</th>
                            <th>积分</th>
                        </tr>
                        <tbody class="my_game_rank_field_item_table_content">
                            <tr>
                                <td>1</td>
                                <td>小红</td>
                                <td>1500</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <br>
                    
                </div>
            </div>
        `);
        this.hide();
        this.root.$my_game.append(this.$rank);
        this.$rank_return = this.$rank.find(".my_game_rank_field_item_return");
        this.$table_content = this.$rank.find(".my_game_rank_field_item_table_content");
        this.start();
    }
    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        let outer = this;
        this.$rank_return.click(function(){
            outer.hide();
            outer.root.menu.show();
        });
    }

    hide(){
        this.$rank.hide();
    }

    show(page){
        this.$table_content.empty();
        let outer = this;
        let page_num = 5;
        let l = page_num * (page - 1) + 1;
        let r = l + page_num - 1;
        $.ajax({
            url: "https://app1281.acapp.acwing.com.cn/rank/get_rank",
            type: "GET",
            data:{
                l: l,
                r: r,
            },
            success:function(resp){
                if(resp.result==="success"){
                    let players = resp.rank_list;
                    for(let i=0;i<players.length;i++){
                        let player = players[i];
                        let obj = "<tr><td>"+(l+i)+"</td><td>"+player.username+"</td><td>"+player.score+"</td></tr>";
                        outer.$table_content.append(obj);
                    }
                }
            },
        });
        this.$rank.show();
    }
}
