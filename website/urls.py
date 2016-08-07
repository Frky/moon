from django.conf.urls import url, include

from django.contrib.auth.views import login as django_login
from django.contrib.auth.views import logout as django_logout

from . import views


urlpatterns = [
    url(r'^$', views.index, name="index"),
    url(r'^cmptr/(?P<label>[\w-]{,50})/$', views.comptoir),

    # Django authentication views
    url(r'^login$', django_login, name="login"),
    url(r'^logout$', django_logout, name="logout"),
    # Custom register view
    url(r'^register$', views.register, name="register"),
]
