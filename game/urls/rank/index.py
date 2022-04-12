from django.urls import path,include
from game.views.rank.rank import get_rank

urlpatterns = [
    path('get_rank/',get_rank,name="rank_get_rank"),
]
