from django.db import models

# Create your models here.

class College(models.Model):
    college_id = models.AutoField(primary_key=True)
    college_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    dean_user_id = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='dean_of_college')
    created_at = models.DateTimeField(auto_now_add=True)
    campus_location = models.CharField(max_length=100)
    
    def __str__(self):
        return self.college_name


class Department(models.Model):
    department_id = models.AutoField(primary_key=True)
    dept_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    head_user_id = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='head_of_department')
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='departments')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.dept_name


class Program(models.Model):
    program_id = models.AutoField(primary_key=True)
    program_name = models.CharField(max_length=100)
    degree_level = models.CharField(max_length=50, choices=[
        ('certificate', 'Certificate'),
        ('diploma', 'Diploma'),
        ('bachelors', 'Bachelors'),
        ('masters', 'Masters'),
        ('phd', 'PhD')
    ])
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='programs')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programs')
    program_head = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='heading_programs')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('program_name', 'degree_level', 'department')
    
    def __str__(self):
        return f"{self.program_name} ({self.get_degree_level_display()})"
