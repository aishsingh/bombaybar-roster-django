# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import HttpResponse

from .models import Staff

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
