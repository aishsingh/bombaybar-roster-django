# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-11-21 09:21
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='History',
            fields=[
                ('hid', models.AutoField(primary_key=True, serialize=False)),
                ('hdate', models.DateField()),
                ('hstarttime', models.TimeField()),
                ('hendtime', models.TimeField()),
                ('sid', models.IntegerField()),
            ],
            options={
                'db_table': 'HISTORY',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Roster',
            fields=[
                ('rid', models.AutoField(primary_key=True, serialize=False)),
                ('rday', models.IntegerField()),
                ('rstarttime', models.TimeField()),
                ('rendtime', models.TimeField()),
                ('sid', models.IntegerField()),
            ],
            options={
                'db_table': 'ROSTER',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Staff',
            fields=[
                ('sid', models.AutoField(primary_key=True, serialize=False)),
                ('sname', models.CharField(max_length=30)),
                ('spayrate', models.FloatField()),
                ('spayfixed', models.IntegerField()),
                ('sposition', models.IntegerField()),
                ('snote', models.CharField(blank=True, max_length=30, null=True)),
            ],
            options={
                'db_table': 'STAFF',
                'managed': False,
            },
        ),
    ]
