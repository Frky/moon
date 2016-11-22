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
    if req.user.is_authenticated():
        return redirect('agora')
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
    if next_page is not None:
        if next_page == "":
            next_page = "agora"
        return redirect(next_page)
    return render(req, "website/index.html", {
        'anonymousForm': AnonymousForm(),
        'registeredForm': RegisteredForm(),
    })


@login_required(login_url="index")
def underground_comptoir(req, label=None):
    return render(req, "website/comptoir.html", {})


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

