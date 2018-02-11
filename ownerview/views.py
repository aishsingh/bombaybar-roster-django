# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from datetime import date, datetime, time, timedelta
from django.utils.timezone import is_aware
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.core.serializers import serialize
from django.core.exceptions import ValidationError
from itertools import chain
import json

from .models import Staff, Roster, History


class LazyEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, time):
            if is_aware(obj):
                raise ValueError("JSON can't represent timezone-aware times.")
            r = obj.strftime("%H:%M")
            if obj.microsecond:
                r = r[:12]
            return r
        if isinstance(obj, set):
            return list(obj)

        return super(LazyEncoder, self).default(obj)

@login_required
def index(request):
    staff_list = Staff.objects.order_by('sname')
    context = {'staff_list': staff_list}
    return render(request, 'ownerview/index.html', context)

@login_required
def get_weekly_staff(request, startdate, enddate):
    start_date = datetime.strptime(startdate, "%Y-%m-%d")
    end_date = datetime.strptime(enddate, "%Y-%m-%d")

    staff_history = History.objects.filter(hdate__range=(start_date, end_date)).values('staff').distinct()  # Prefer to use staff history as it has possible roster changes
    remaining_staff = Staff.objects.exclude(sid__in=staff_history).values('sid')
    staff_roster = Roster.objects.filter(staff__in=remaining_staff).values('staff').distinct()  # Staff that have no changes from their regular roster

    relevent_staff = list(chain(staff_history.values('staff', 'location'), staff_roster.values('staff', 'location')))  # Combine both queries
    serialized = json.dumps(relevent_staff)

    return HttpResponse(serialized, content_type="application/javascript")

@login_required
def get_roster(request):
    weekly_roster = Roster.objects.order_by('staff__sname')
    serialized = serialize('json', weekly_roster, cls=LazyEncoder)
    return HttpResponse(serialized, content_type="application/javascript")

@login_required
def get_weekly_history(request, startdate, enddate):
    start_date = datetime.strptime(startdate, "%Y-%m-%d")
    end_date = datetime.strptime(enddate, "%Y-%m-%d")

    weekly_history = History.objects.filter(hdate__range=(start_date, end_date)).order_by('staff__sname')
    serialized = serialize('json', weekly_history, cls=LazyEncoder)
    return HttpResponse(serialized, content_type="application/javascript")

@login_required
def create_history(request):
    h = History(
            hdate = request.POST['date'],
            htype = request.POST['type'],
            hstarttime = request.POST['start'] if request.POST['start'] else None,
            hendtime = request.POST['end'] if request.POST['end'] else None,
            staff = Staff.objects.get(pk=request.POST['sid'])
    );

    try:
        h.save();
    except ValidationError, err:
        return HttpResponse("Validation error", status=400, reason="; ".join(err.messages));

    return HttpResponse("Success");

@login_required
def roster(request):
    staff_list = Staff.objects.order_by('sname')

    context = { 'staff_list': staff_list }
    return render(request, 'ownerview/roster.html', context)

@login_required
def staff(request, staff_id):
    staff = get_object_or_404(Staff, pk=staff_id)
    context = {'staff': staff}
    return render(request, 'ownerview/staff.html', context)

@login_required
def staff_list(request):
    staff_list = Staff.objects.order_by('sname')
    context = {'staff_list': staff_list}
    return render(request, 'ownerview/staff_list.html', context)
