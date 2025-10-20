from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path("api/quote/", views.quote_request, name="quote-request"),
]
