# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin
from .models import Staff, Roster, History


class StaffAdmin(admin.ModelAdmin):
    fieldsets = [
        ('Details', {'fields': ['sname', 'sposition']}),
        ('Salary', {'fields': ['spayfixed', 'spayrate']}),
        ('Other', {'fields': ['snote']}),
    ]
    list_display = ('sname', 'sposition', 'snote')

# Register your models here.
admin.site.register(Staff, StaffAdmin)
admin.site.register(Roster)
admin.site.register(History)
