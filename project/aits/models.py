

# Create your models here.
from django.db import models

class Departments(models.Model):
   department_id = models.IntegerField(null=True)
   name = models.CharField(max_length=200)
   dept_name = models.CharField(max_length=500)
   dept_description = models.CharField(max_length=500)
   dept_head = models.CharField(max_length=200)
   dept_head_email = models.EmailField(max_length=200,default="admin@gmail.com")
   dept_head_phone = models.CharField(max_length=200)
   created_at = models.DateTimeField("date created", default=None)
   updated_at = models.DateTimeField("date updated",default=None)

class Role(models.Model):
   role_name = models.CharField(max_length=200)
   role_description = models.CharField(max_length=200)
   permissions = models.JSONField
   created_at = models.DateTimeField("date created",default=None)  
   def __str__(self):
        return self.role_name

class Group(models.Model):
   group_id = models.IntegerField(null=True)
   group_name = models.CharField(max_length=200,default=None)
   group_description = models.CharField(max_length=200,default=None)
   created_at = models.DateTimeField("date created",default=None)
   updated_at = models.DateTimeField("date updated",default=None)
   department_id = models.ForeignKey(Departments, on_delete=models.CASCADE, null=True)


class User(models.Model):
   user_id = models.IntegerField(null=True)
   fullname = models.CharField(max_length=200,default=None)
   username = models.CharField(max_length=200,default=None)
   email = models.EmailField(max_length=200,default="aits@gmail.com")
   student_number = models.IntegerField(default=None)
   password = models.CharField(max_length=200,default=None)
   department_id = models.ForeignKey(Departments, on_delete=models.CASCADE, null=True)
   last_login = models.DateTimeField("date last login",default=None)
   role_id = models.ForeignKey(Role, on_delete=models.CASCADE)
   is_active = models.BooleanField(default=False)
   def __str__(self):
             return self.fullname

class IssueCategory(models.Model):
   category_id = models.IntegerField(null=True)
   category_name = models.CharField(max_length=200)
   category_description = models.CharField(max_length=200)
   created_at = models.DateTimeField("date created", default=None)
   updated_at = models.DateTimeField("date updated", default=None)

class IssueStatus(models.Model):
   status_id = models.IntegerField(null=True)
   status_name = models.CharField(max_length=200,default=None)
   status_description = models.CharField(max_length=200,default=None)
   created_at = models.DateTimeField("date created", default=None)
   updated_at = models.DateTimeField("date updated", default=None)

class Priority(models.Model):
   priority_id = models.IntegerField(null=True)
   priority_name = models.CharField(max_length=200,default=None)
   priority_description = models.CharField(max_length=200,default=None)
   created_at = models.DateTimeField("date created", default=None)
   updated_at = models.DateTimeField("date updated", default=None)

class Issues(models.Model):
   issue_id = models.IntegerField(null=True)
   description = models.CharField(max_length=200,null=True)
   title = models.CharField(max_length=300,null=True)
   user_id = models.ForeignKey(User, on_delete=models.CASCADE,default=None)
   status_id = models.ForeignKey(IssueStatus, on_delete=models.CASCADE,default=None)
   pub_date = models.DateTimeField("date published", default=None)
   creation_date = models.DateTimeField("date created", default=None)
   updated_date = models.DateTimeField("date updated", default=None)
   resolved_at = models.DateTimeField("date resolved", default=None)
   priority_id = models.ForeignKey(Priority, on_delete=models.CASCADE,default=None)
   category_id = models.ForeignKey(IssueCategory, on_delete=models.CASCADE,default=None)
   user_group_id = models.ForeignKey(Group, on_delete=models.CASCADE,default=None)

class IssueHistory(models.Model):
      issue_history_id = models.ForeignKey(Issues, on_delete=models.CASCADE)
      status_id = models.ForeignKey(IssueStatus, on_delete=models.CASCADE)
      created_at = models.DateTimeField("date_created", default=None)
      updated_at = models.DateTimeField("date updated", default=None)
      assigned_toId = models.ForeignKey(User, on_delete=models.CASCADE, null=True)

      
class Notifications(models.Model):
      notifications_id = models.CharField(max_length=200, default=None)
      user_id = models.ForeignKey(User, on_delete=models.CASCADE, default=None)
      message = models.CharField(max_length=200, default=None)
      created_at = models.DateTimeField("date created", default=None)
      updated_at = models.DateTimeField("date updated", default=None)
      type = models.CharField(max_length=200)
      read = models.BooleanField(default=False)
      issue_id = models.ForeignKey(Issues, on_delete=models.CASCADE)
      group_id = models.ForeignKey(Group, on_delete=models.CASCADE)