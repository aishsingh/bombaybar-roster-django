# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from __future__ import unicode_literals

from django.db import models


class Staff(models.Model):
    sid = models.AutoField(primary_key=True)
    sname = models.CharField(max_length=30)
    spayrate = models.FloatField()
    spayfixed = models.BooleanField()
    sposition = models.IntegerField()
    snote = models.CharField(max_length=30, blank=True, null=True)

    def __unicode__(self):
        return self.sname

    class Meta:
        managed = False
        db_table = 'STAFF'


class Event(models.Model):
    eid = models.AutoField(primary_key=True)
    ename = models.CharField(max_length=30, blank=True, null=True)
    edate = models.DateField()
    etype = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'EVENT'


class Location(models.Model):
    lid = models.AutoField(primary_key=True)
    lname = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'LOCATION'

class RosterData(models.Model):
    starttime = models.TimeField(blank=True, null=True)
    endtime = models.TimeField(blank=True, null=True)
    staff = models.ForeignKey(Staff, db_column='sid', on_delete=models.CASCADE)
    location = models.ForeignKey(Location, db_column='lid', on_delete=models.CASCADE)

    class Meta:
        abstract = True

class History(RosterData):
    hid = models.AutoField(primary_key=True)
    hdate = models.DateField()
    htype = models.IntegerField()
    starttime = models.TimeField(blank=True, null=True, db_column='hstarttime')
    endtime = models.TimeField(blank=True, null=True, db_column='hendtime')
    hnote = models.CharField(max_length=10, blank=True, null=True)
    # staff = models.ForeignKey(Staff, db_column='sid', on_delete=models.CASCADE)
    # location = models.ForeignKey(Location, db_column='lid', on_delete=models.CASCADE)

    class Meta:
        managed = False
        db_table = 'HISTORY'


class Roster(RosterData):
    rid = models.AutoField(primary_key=True)
    rday = models.IntegerField()
    starttime = models.TimeField(blank=True, null=True, db_column='rstarttime')
    endtime = models.TimeField(blank=True, null=True, db_column='rendtime')
    # staff = models.ForeignKey(Staff, db_column='sid', on_delete=models.CASCADE)
    # location = models.ForeignKey(Location, db_column='lid', on_delete=models.CASCADE)

    def __unicode__(self):
        return "%s from %s to %s" % (self.rday, self.rstarttime, self.rendtime)

    class Meta:
        managed = False
        db_table = 'ROSTER'



# class AuthGroup(models.Model):
#     name = models.CharField(unique=True, max_length=80)
#
#     class Meta:
#         managed = False
#         db_table = 'auth_group'
#
#
# class AuthGroupPermissions(models.Model):
#     group_id = models.IntegerField()
#     permission_id = models.IntegerField()
#
#     class Meta:
#         managed = False
#         db_table = 'auth_group_permissions'
#
#
# class AuthPermission(models.Model):
#     name = models.CharField(max_length=50)
#     content_type_id = models.IntegerField()
#     codename = models.CharField(max_length=100)
#
#     class Meta:
#         managed = False
#         db_table = 'auth_permission'
#
#
# class AuthUser(models.Model):
#     password = models.CharField(max_length=128)
#     last_login = models.DateTimeField()
#     is_superuser = models.IntegerField()
#     username = models.CharField(unique=True, max_length=30)
#     first_name = models.CharField(max_length=30)
#     last_name = models.CharField(max_length=30)
#     email = models.CharField(max_length=75)
#     is_staff = models.IntegerField()
#     is_active = models.IntegerField()
#     date_joined = models.DateTimeField()
#
#     class Meta:
#         managed = False
#         db_table = 'auth_user'
#
#
# class AuthUserGroups(models.Model):
#     user_id = models.IntegerField()
#     group_id = models.IntegerField()
#
#     class Meta:
#         managed = False
#         db_table = 'auth_user_groups'
#
#
# class DjangoContentType(models.Model):
#     name = models.CharField(max_length=100)
#     app_label = models.CharField(max_length=100)
#     model = models.CharField(max_length=100)
#
#     class Meta:
#         managed = False
#         db_table = 'django_content_type'
#         unique_together = (('app_label', 'model'),)
#
#
# class DjangoMigrations(models.Model):
#     app = models.CharField(max_length=255)
#     name = models.CharField(max_length=255)
#     applied = models.DateTimeField()
#
#     class Meta:
#         managed = False
#         db_table = 'django_migrations'
