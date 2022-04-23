from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache
def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0,9))
    return res

def apply_code(request):
    apply_code_uri="https://www.acwing.com/third_party/api/oauth2/web/authorize/"
    appid = "1281"
    redirect_uri = "https://wishball.dylolorz.cn/settings/acwing/acapp/receive_code/"
    scope = "userinfo"
    state = get_state()
    cache.set(state,True,7200)
    return JsonResponse({
        'result': "success",
        'appid': appid,
        'redirect_uri': redirect_uri,
        'scope': scope,
        'state': state,
    })
