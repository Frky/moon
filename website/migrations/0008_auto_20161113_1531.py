# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-11-13 15:31
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0007_auto_20161113_1346'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='connexionrecord',
            unique_together=set([]),
        ),
        migrations.RemoveField(
            model_name='connexionrecord',
            name='comptoir',
        ),
        migrations.DeleteModel(
            name='ConnexionRecord',
        ),
    ]