from django.urls import path,include
from game.views.index import index
urlpatterns = [
    path('',index, name="index"),
]
