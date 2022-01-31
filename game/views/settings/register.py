from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player

def register(request):
    data = request.GET
    username = data.get('username',"").strip()
    password =data.get('password',"").strip()
    password_confirm = data.get('password_confirm',"").strip()
    if not username or not password:
        return  JsonResponse({
            'result': "用户名或密码不能为空",
        })
    if password != password_confirm:
        return JsonResponse({
            'result':"两次密码不一致",
        })
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result':"用户名已存在",
        })
    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, photo="https://cdn.acwing.com/media/user/profile/photo/12012_lg_9e3c12b27c.jpg")
    login(request,user);
    return JsonResponse({
        'result': "success",
    })
