from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render

from .models import Room
from .forms import UsernameForm


def home(request):

    if request.method == 'POST':
        form = UsernameForm(request.POST)
        if form.is_valid():
            cleaned_data = form.cleaned_data
            user = authenticate(username=cleaned_data.get('username'))
            if user is not None and user.is_active:
                login(request, user)
    else:
        form = UsernameForm()

    return render(request, "website/home.html", {'form': form})


def room(request, label):
    # If the room with the given label doesn't exist, automatically create it
    # upon first visit (a la etherpad).
    room, created = Room.objects.get_or_create(label=label)

    # We want to show the last 50 messages, ordered most-recent-last
    messages = reversed(room.messages.order_by('-timestamp')[:50])

    return render(request, "website/room.html", {
        'room': room,
        'messages': messages,
    })
