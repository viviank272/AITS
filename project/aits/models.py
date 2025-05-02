from django.contrib.auth.models import AbstractUser
from django.db import models
from simple_history.models import HistoricalRecords

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('head_of_department', 'Head of Department'),
        ('academic_registrar', 'Academic Registrar'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    department = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)  # Ensure email is unique and required
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)  # Optional username

    USERNAME_FIELD = 'email'  # Use email as the login field
    REQUIRED_FIELDS = ['role']  # Required fields besides email and password

class Issue(models.Model):
    # Same as before
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    )
    ISSUE_TYPE_CHOICES = (
        ('missing_marks', 'Missing Marks'),
        ('appeals', 'Appeals'),
        ('corrections', 'Corrections'),
    )
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='issues')
    course_code = models.CharField(max_length=20)
    issue_type = models.CharField(max_length=20, choices=ISSUE_TYPE_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

class Comment(models.Model):
    # Same as before
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    # Same as before
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)