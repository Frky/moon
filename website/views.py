from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.shortcuts import render, redirect

from website.models import Comptoir
from .forms import UsernameForm

def index(req):
    # Homepage of the website
    print AuthenticationForm()
    return render(req, "website/index.html", {
        'registrationForm': UserCreationForm(),
        'authenticationForm': AuthenticationForm(),
    })

def comptoir(req, label):
    # If the comptoir with the given label doesn't exist, automatically create it
    # upon first visit (a la etherpad).
    comptoir, created = Comptoir.objects.get_or_create(label=label)

    # We want to show the last 50 messages, ordered most-recent-last
    messages = reversed(comptoir.messages.order_by('-timestamp')[:50])

    return render(req, "website/comptoir.html", {
        'comptoir': comptoir,
        'messages': messages,
    })

# Authentication views
def register(req):
    reg_form = UserCreationForm(req.POST or None, label_suffix='')
    # Check the form validity
    if reg_form.is_valid():
        # Register the new user
        new_user = reg_form.save()
        # Authenticate
        new_user = authenticate(username=new_user.username, password=req.POST["password1"])
        # Log the new user in
        login(req, new_user)
    else:
        # TODO better
        print reg_form.errors
    return redirect("index")

