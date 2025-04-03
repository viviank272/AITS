from django.db import models
from django.conf import settings


class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    college = models.ForeignKey('academic.College', on_delete=models.SET_NULL, null=True, blank=True, 
                               related_name='categories', help_text="Null for global categories")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"


class Priority(models.Model):
    priority_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    level = models.IntegerField()
    sla_hours = models.IntegerField(help_text="Service Level Agreement time in hours")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Priorities"
        ordering = ['level']


class Status(models.Model):
    status_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    is_terminal = models.BooleanField(default=False, help_text="Indicates if this status marks the end of an issue lifecycle")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Statuses"


class Issue(models.Model):
    issue_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reported_issues')
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, 
                                related_name='assigned_issues')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='issues')
    priority = models.ForeignKey(Priority, on_delete=models.SET_NULL, null=True, related_name='issues')
    status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True, related_name='issues')
    college = models.ForeignKey('academic.College', on_delete=models.SET_NULL, null=True, related_name='issues')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    is_student_issue = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title


class Comment(models.Model):
    comment_id = models.AutoField(primary_key=True)
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_internal = models.BooleanField(default=False, help_text="Internal comments are only visible to staff")
    
    def __str__(self):
        return f"Comment on {self.issue.title} by {self.user.full_name}"


class Attachment(models.Model):
    attachment_id = models.AutoField(primary_key=True)
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='attachments', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attachments')
    file_name = models.CharField(max_length=255)
    file_path = models.FileField(upload_to='issue_attachments/')
    file_type = models.CharField(max_length=50)
    file_size = models.IntegerField(help_text="Size in bytes")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.file_name


class IssueHistory(models.Model):
    history_id = models.AutoField(primary_key=True)
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='history')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='issue_changes')
    field_name = models.CharField(max_length=100)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Change to {self.issue.title} by {self.user.full_name}"
    
    class Meta:
        verbose_name_plural = "Issue Histories"


class Notification(models.Model):
    notification_id = models.AutoField(primary_key=True)
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='notifications')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Notification for {self.user.full_name}: {self.message[:30]}..."
