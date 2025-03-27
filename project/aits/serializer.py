from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Issue, Comment, Notification

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'role', 'department', 'first_name', 'last_name']

class IssueSerializer(serializers.ModelSerializer):
    days_open = serializers.SerializerMethodField()

    def get_days_open(self, obj):
        return (timezone.now() - obj.created_at).days

    class Meta:
        model = Issue
        fields = ['id', 'student', 'course_code', 'issue_type', 'description', 'status', 'assigned_to', 'created_at', 'updated_at', 'days_open']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'issue', 'user', 'text', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'read', 'created_at']