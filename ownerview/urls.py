from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^roster$', views.roster, name='roster'),
    url(r'^getroster/', views.get_roster),
    url(r'^getweeklyhistory/(?P<startdate>\d{4}-\d{2}-\d{2})/(?P<enddate>\d{4}-\d{2}-\d{2})/', views.get_weekly_history),
    url(r'^staff$', views.staff, name='staff'),
]
