from django.db import models
from django.contrib.auth.models import User  
import json

class College(models.Model):
    college_id = models.AutoField(primary_key=True)
    college_name = models.CharField(max_length=50)

    def __str__(self):
        return self.college_name


class Department(models.Model):
    department_id = models.AutoField(primary_key=True)
    department_name = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    head_user_id = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True) 
    college_id = models.ForeignKey(College, on_delete=models.CASCADE) 
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True) 

    def __str__(self):
        return self.department_name


class Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    permissions = models.JSONField() 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.role_name

class User(models.Model):
    user_id = models.AutoField(primary_key=True)  
    username = models.CharField(max_length=255, unique=True)  
    email = models.EmailField(max_length=255, unique=True)  
    password_hash = models.CharField(max_length=255)  
    full_name = models.CharField(max_length=255)  
    role_id = models.IntegerField()
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="users)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.full_name})"




