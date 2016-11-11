import bcrypt

from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.shortcuts import render, redirect

from website.models import UndergroundComptoir
from .forms import UsernameForm

def index(req):
    # Homepage of the website
    return render(req, "website/index.html", {
        'registrationForm': UserCreationForm(),
        'authenticationForm': AuthenticationForm(),
    })

@login_required(login_url="index")
def underground_comptoir(req, label):
    # First, key provided or not?
    if "key" in req.POST.keys():
        key = req.POST["key"]
    elif "key" in req.GET.keys():
        key = req.GET["key"]
    else:
        key = None

    # First, see if comptoir exists
    try:
        comptoir = UndergroundComptoir.objects.get(label=label)
        # Get fingerprint from the key
        if key is not None:
            salt = comptoir.keyprint
            keyprint = bcrypt.hashpw(key.encode("utf-8"), salt.encode("utf-8"))
        else:
            keyprint = None
        # Check the keyprint
        if keyprint != comptoir.keyprint:
            # TODO error message
            # TODO handle error correctly
            # (redirect to home is NOT a reliable way to do)
            return redirect("index")
    # If not
    except ObjectDoesNotExist:
        # We create it
        if key is None: 
            keyprint = None
        else:
            keyprint = bcrypt(key.encode("utf-8"), bcrypt.gensalt()),
        comptoir = UndergroundComptoir(
                                        label=label, 
                                        keyprint=keyprint,
                                    )
        comptoir.save()
        
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
        print(reg_form.errors)
    return redirect("index")

