import bcrypt

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User
from django.shortcuts import render, redirect

from website.models import UndergroundComptoir
from .forms import AnonymousForm, RegisteredForm

def index(req):
    # Homepage of the website
    # If a form was posted
    if "form_type" in req.POST.keys():
        username = req.POST.get("username")
        # Anonymous registration
        if req.POST["form_type"] == "anonymous":
            password = getattr(settings, "ANONYMOUS_PASSWORD", None) 
            # If username does not exist, 
            # create it with default anonymous password
            user, created = User.objects.get_or_create(username=username)
            if created:
                print("user created")
                user.set_password(password)
                user.save()
        elif req.POST["form_type"] == "registered":
            password = req.POST.get("password")
        print(username, password)
        user = authenticate(username=username, password=password)
        if user is not None and user.is_authenticated():
            login(req, user)
    next_page = req.POST.get("next")
    if next_page is not None and next_page != "":
        return redirect(next_page)
    return render(req, "website/index.html", {
        'anonymousForm': AnonymousForm(),
        'registeredForm': RegisteredForm(),
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
        comptoir = UndergroundComptoir.objects.get(name=label)
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
            name=label,
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

