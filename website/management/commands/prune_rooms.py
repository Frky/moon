from django.core.management.base import BaseCommand
from website.models import aComptoir


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        aComptoir.objects.prune_rooms()