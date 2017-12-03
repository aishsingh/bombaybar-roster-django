# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import HttpResponse

from .models import Staff, Roster

# def index(request):
#     return HttpResponse("Hello, world. You're at the overview index.")

# def index(request):
#     all_staff_list = Staff.objects.order_by('-sname')[:5]
#     output = ', '.join([s.sname for s in all_staff_list])
#     return HttpResponse(output)

def index(request):
    staff_list = Staff.objects.order_by('sname')
    context = {'staff_list': staff_list}
    return render(request, 'ownerview/index.html', context)

def roster(request):
    staff_list = Staff.objects.order_by('sname')
    roster_list = Roster.objects.order_by('rid')
    context = {
            'staff_list': staff_list,
            'roster_list': roster_list,
            }
    return render(request, 'ownerview/roster.html', context)

def staff(request):
    staff_list = Staff.objects.order_by('sname')
    context = {'staff_list': staff_list}
    return render(request, 'ownerview/staff.html', context)
