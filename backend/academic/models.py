from django.db import models

# Create your models here.

class College(models.Model):
    college_id = models.AutoField(primary_key=True)
    college_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    dean_user_id = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='dean_of_college')
    created_at = models.DateTimeField(auto_now_add=True)
    campus_location = models.CharField(max_length=100)
    is_disabled = models.BooleanField(default=False)
    
    def __str__(self):
        return self.college_name


class Department(models.Model):
    department_id = models.AutoField(primary_key=True)
    dept_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    head_user_id = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='head_of_department')
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='departments')
    created_at = models.DateTimeField(auto_now_add=True)
    is_disabled = models.BooleanField(default=False)
    
    def __str__(self):
        return self.dept_name


class Program(models.Model):
    program_id = models.AutoField(primary_key=True)
    program_name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, blank=True, null=True, help_text="Program code/abbreviation (e.g., BSCS)")
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='programs')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programs')
    duration = models.CharField(max_length=20, default="3 years", help_text="Program duration (e.g., 3 years)")
    program_head = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='heading_programs')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('program_name', 'department')
    
    def __str__(self):
        return self.program_name
