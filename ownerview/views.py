# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from datetime import date, time, timedelta
from django.utils.timezone import is_aware
from django.core.serializers.json import DjangoJSONEncoder
from django.core.serializers import serialize

from .models import Staff, Roster


class LazyEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, time):
            if is_aware(obj):
                raise ValueError("JSON can't represent timezone-aware times.")
            r = obj.strftime("%H:%M")
            if obj.microsecond:
                r = r[:12]
            return r
        return super(LazyEncoder, self).default(obj)

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
def get_weekly_roster(request):
    weekly_roster = Roster.objects.order_by('staff__sname')
    serialized = serialize('json', weekly_roster, cls=LazyEncoder)
    return HttpResponse(serialized, content_type="application/javascript")


@login_required
def roster(request):
    staff_list = Staff.objects.order_by('sname')
    roster_list = Roster.objects.order_by('rid')
    days_list = get_week_days(date.today().year, date.today().isocalendar()[1])
    day_of_week = date.today().isoweekday()
    weekly_roster = Roster.objects.order_by('staff__sname')

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
