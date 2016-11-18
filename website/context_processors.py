from django.conf import settings


def webpack_dev(request):
    # return the value you want as a dictionnary. you may add multiple values in there.
    return {
        'DEV': getattr(settings, 'DEV', False),
        'TEST': getattr(settings, 'TEST', False),
    }
