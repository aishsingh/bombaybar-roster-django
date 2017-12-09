# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import HttpResponse

from .models import Staff, Roster


from datetime import date, timedelta

from django.contrib.auth.decorators import login_required

def get_week_days(year, week):
    d = date(year,1,1)
    if(d.weekday()>3):
        d = d+timedelta(7-d.weekday())
    else:
        d = d - timedelta(d.weekday())
    dlt = timedelta(days = (week-1)*7)
    # return d + dlt,  d + dlt + timedelta(days=6)
    return d + dlt, d + dlt + timedelta(days=1), d + dlt + timedelta(days=2), d + dlt + timedelta(days=3), d + dlt + timedelta(days=4), d + dlt + timedelta(days=5), d + dlt + timedelta(days=6)


@login_required
def index(request):
    staff_list = Staff.objects.order_by('sname')
    context = {'staff_list': staff_list}
    return render(request, 'ownerview/index.html', context)

@login_required
def roster(request):
    staff_list = Staff.objects.order_by('sname')
    roster_list = Roster.objects.order_by('rid')
    days_list = get_week_days(date.today().year, date.today().isocalendar()[1])
    day_of_week = date.today().isoweekday()
    weekly_roster = Roster.objects.order_by('staff__sname')
    # weekly_roster = Staff.objects.filter(roster__rday='0')

    context = {
            'staff_list': staff_list,
            'roster_list': roster_list,
            'days_list': days_list,
            'day_of_week': day_of_week,
            'weekly_roster': weekly_roster,
            }
    return render(request, 'ownerview/roster.html', context)

@login_required
def staff(request):
    staff_list = Staff.objects.order_by('sname')
    context = {'staff_list': staff_list}
    return render(request, 'ownerview/staff.html', context)
