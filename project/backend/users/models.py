from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import json


class RoleManager(models.Manager):
    def get_by_natural_key(self, role_name):
        return self.get(role_name=role_name)


class Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    permissions = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    objects = RoleManager()
    
    def __str__(self):
        return self.role_name
    
    def natural_key(self):
        return (self.role_name,)


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, related_name='users')
    department = models.ForeignKey('academic.Department', on_delete=models.SET_NULL, null=True, related_name='users')
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    user_type = models.CharField(max_length=20, choices=[
        ('lecturer', 'Lecturer'),
        ('student', 'Student'),
        ('registrar', 'Registrar'),
        ('admin', 'Administrator')
    ])
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name']
    
    def __str__(self):
        return f"{self.full_name} ({self.email})"


class Student(models.Model):
    student_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_number = models.IntegerField(unique=True, help_text="Unique student identifier number")
    registration_number = models.CharField(max_length=20, unique=True, help_text="Registration/enrollment number")
    college = models.ForeignKey('academic.College', on_delete=models.CASCADE, related_name='students')
    department = models.ForeignKey('academic.Department', on_delete=models.CASCADE, 
                                  related_name='department_students')
    program = models.ForeignKey('academic.Program', on_delete=models.CASCADE, related_name='students')
    year_level = models.IntegerField()
    semester_in_year = models.IntegerField(choices=[(1, 'Semester 1'), (2, 'Semester 2')], default=1, 
                                       help_text="Current semester within the academic year (1 or 2)")
    current_semester = models.IntegerField(default=1, help_text="Cumulative semester number throughout the program (1-8 for 4 years, 1-10 for 5 years)")
    enrollment_status = models.CharField(max_length=20, choices=[
        ('enrolled', 'Enrolled'),
        ('on_leave', 'On Leave'),
        ('graduated', 'Graduated'),
        ('suspended', 'Suspended'),
        ('withdrawn', 'Withdrawn')
    ])
    admission_date = models.DateField()
    expected_graduation = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.full_name} ({self.student_number})"
    
    def calculate_current_semester(self):
        """Calculate the current cumulative semester based on year and semester within the year"""
        if self.year_level and self.semester_in_year:
            return ((self.year_level - 1) * 2) + self.semester_in_year
        return 1
        
    def save(self, *args, **kwargs):
        # Ensure department is consistent with the program's department
        if self.program and (not self.department or 
                         (hasattr(self.program, 'department') and 
                          self.program.department.department_id != self.department.department_id)):
            self.department = self.program.department
        
        # Calculate current_semester before saving
        if not self.current_semester or (self.year_level and self.semester_in_year):
            self.current_semester = self.calculate_current_semester()
            
        super().save(*args, **kwargs)
