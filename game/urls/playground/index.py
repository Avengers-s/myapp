from django.urls import path,include
from game.views.playground.update_score import update_score
urlpatterns= [
    path('update_score/',update_score,name="playground/update_score")
]
