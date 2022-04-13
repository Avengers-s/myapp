from django.http import JsonResponse
from game.models.player.player import Player
def update_score(request):
    data = request.GET
    score = data.get('score')
    username = data.get('username')
    score = int(score)
    player = Player.objects.get(user__username=username)
    player.score +=score
    player.save()
    return JsonResponse({
        'result': "success",
    })
