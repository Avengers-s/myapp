from django.http import JsonResponse
from game.models.player.player import Player
def get_rank(request):
    data = request.GET
    l = data.get('l')
    r = data.get('r')
    l = int(l)
    r = int(r)
    l = l - 1
    r = r - 1
    players = Player.objects.all().order_by('-score')[0:100]
    rank_players = []
    for player in players:
        temp_player = {}
        temp_player['username'] = player.user.username
        temp_player['photo'] = player.photo
        temp_player['score'] = player.score
        rank_players.append(temp_player)
    return JsonResponse({
        'result': "success",
        'rank_list':rank_players,
    });
