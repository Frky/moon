# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-08-02 21:12
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0002_auto_20160801_2156'),
    ]

    operations = [
        migrations.AddField(
            model_name='connexionrecord',
            name='instances',
            field=models.IntegerField(default=0),
        ),
    ]