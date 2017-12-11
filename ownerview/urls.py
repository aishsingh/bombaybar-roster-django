from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^roster$', views.roster, name='roster'),
    url(r'^getweeklyroster/', views.get_weekly_roster),
    url(r'^staff$', views.staff, name='staff'),
]
