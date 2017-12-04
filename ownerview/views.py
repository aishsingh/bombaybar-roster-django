# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import HttpResponse

from .models import Staff, Roster


from datetime import date, timedelta

def get_week_days(year, week):
    d = date(year,1,1)
    if(d.weekday()>3):
        d = d+timedelta(7-d.weekday())
    else:
        d = d - timedelta(d.weekday())
    dlt = timedelta(days = (week-1)*7)
    # return d + dlt,  d + dlt + timedelta(days=6)
    return d + dlt, d + dlt + timedelta(days=1), d + dlt + timedelta(days=2), d + dlt + timedelta(days=3), d + dlt + timedelta(days=4), d + dlt + timedelta(days=5), d + dlt + timedelta(days=6)



def index(request):
    staff_list = Staff.objects.order_by('sname')
    context = {'staff_list': staff_list}
    return render(request, 'ownerview/index.html', context)

def roster(request):
    staff_list = Staff.objects.order_by('sname')
    roster_list = Roster.objects.order_by('rid')
    days_list = get_week_days(date.today().year, date.today().isocalendar()[1])
    day_of_week = date.today().isoweekday()

    context = {
            'staff_list': staff_list,
            'roster_list': roster_list,
            'days_list': days_list,
            'day_of_week': day_of_week,
            }
    return render(request, 'ownerview/roster.html', context)

def staff(request):
    staff_list = Staff.objects.order_by('sname')
    context = {'staff_list': staff_list}
    return render(request, 'ownerview/staff.html', context)
