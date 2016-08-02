from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User


class PasswordlessAuthBackend(ModelBackend):
    """Log in to Django without providing a password.

    """
    def authenticate(self, username=None, **kwargs):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            user = User(username=username)
            user.save()
            return user

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
