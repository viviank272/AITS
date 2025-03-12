from django.contrib import admin

from .models import Role, Departments, Group, User,Issues, IssueCategory, IssueStatus, Priority

admin.site.register(Departments)