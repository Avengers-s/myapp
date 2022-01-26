from django.http import HttpResponse

def index(request):
    line1 = '<h1 style="text-align: center">球球大作战</h1>'
    line2 = '<hr>'
    line3 = '<a href="/play/">进入游戏</a>'
    return HttpResponse(line1+line2+line3)


def play(request):
    line1 = '<h1 style="text-align: center">游戏界面</h1>'
    line2 = '<hr>'
    line3 = '<a href="/">返回首页</a>'
    return HttpResponse(line1+line2+line3)
