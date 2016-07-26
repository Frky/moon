from django.conf.urls import url, include

from . import views


urlpatterns = [
    url(r'^(?P<label>[\w-]{,50})/$', views.home),
]
