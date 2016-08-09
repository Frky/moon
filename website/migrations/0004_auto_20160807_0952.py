# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-08-07 09:52
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0003_connexionrecord_instances'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Room',
            new_name='Comptoir',
        ),
        migrations.RenameField(
            model_name='connexionrecord',
            old_name='room',
            new_name='comptoir',
        ),
        migrations.RenameField(
            model_name='message',
            old_name='room',
            new_name='comptoir',
        ),
        migrations.AlterUniqueTogether(
            name='connexionrecord',
            unique_together=set([('comptoir', 'user')]),
        ),
    ]