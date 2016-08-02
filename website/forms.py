from django import forms


class UsernameForm(forms.Form):
    username = forms.CharField(label='username', max_length=64)


class RoomForm(forms.Form):
    room = forms.CharField(label='room', max_length=64)
