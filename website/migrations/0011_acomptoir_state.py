# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-11-15 18:38
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0010_auto_20161115_1530'),
    ]

    operations = [
        migrations.AddField(
            model_name='acomptoir',
            name='state',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
    ]