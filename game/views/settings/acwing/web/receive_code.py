from django.http import JsonResponse
from django.core.cache import cache
from django.shortcuts import redirect
import requests
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player
from random import randint
def receive_code(request):
    data = request.GET
    code =data.get('code')
    state =data.get('state')
    if not cache.has_key(state):
        return redirect("index")
    cache.delete(state)
    apply_access_token_uri="https://www.acwing.com/third_party/api/oauth2/access_token/"
    appid="1281"
    secret = "6a1a4fc72a21476bb11d42a3d0c942f0"
    params={
        'appid':appid,
        'secret':secret,
        'code':code,
    }
    access_token_res=requests.get(apply_access_token_uri,params=params).json()
    access_token = access_token_res["access_token"]
    openid = access_token_res["openid"]
    players = Player.objects.filter(openid=openid)
    if players.exists():
        login(request,players[0].user)
        return redirect("index")
    
    get_userinfo_url ="https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        'access_token':access_token,
        'openid': openid,
    }
    get_userinfo_res = requests.get(get_userinfo_url,params=params).json()
    username = get_userinfo_res['username']
    photo = get_userinfo_res['photo']
    while User.objects.filter(username=username):
        username+=str(randint(0,9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user,photo=photo,openid=openid)
    login(request,user)
    return redirect("index")
