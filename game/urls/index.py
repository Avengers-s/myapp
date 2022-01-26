from django.urls import path,include
from game.views.index import index,play
urlpatterns = [
    path('',index, name="index"),
    path('play/', play, name="play"),
]
