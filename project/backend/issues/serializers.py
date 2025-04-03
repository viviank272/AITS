from rest_framework import serializers
from .models import (
    Category, Priority, Status, Issue, Comment, 
    Attachment, IssueHistory, Notification
)
from users.serializers import UserSerializer
from users.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'username', 'email', 'full_name']


class CategorySerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.college_name', read_only=True)
    
    class Meta:
        model = Category
        fields = '__all__'


class PrioritySerializer(serializers.ModelSerializer):
    class Meta:
        model = Priority
        fields = '__all__'


class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['comment_id', 'issue', 'user', 'user_details', 'content', 'created_at', 'is_internal']
        read_only_fields = ['created_at']


class AttachmentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Attachment
        fields = ['attachment_id', 'issue', 'user', 'user_details', 'file_name', 
                 'file_path', 'file_type', 'file_size', 'uploaded_at']
        read_only_fields = ['uploaded_at', 'file_type', 'file_size']


class IssueHistorySerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = IssueHistory
        fields = ['history_id', 'issue', 'user', 'user_details', 'field_name', 
                 'old_value', 'new_value', 'changed_at']
        read_only_fields = ['changed_at']


class NotificationSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    issue_title = serializers.CharField(source='issue.title', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['notification_id', 'issue', 'issue_title', 'user', 'user_details', 
                 'type', 'message', 'is_read', 'created_at']
        read_only_fields = ['created_at']


class IssueListSerializer(serializers.ModelSerializer):
    reporter_details = UserSerializer(source='reporter', read_only=True)
    assignee_details = UserSerializer(source='assignee', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    priority_name = serializers.CharField(source='priority.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    college_name = serializers.CharField(source='college.college_name', read_only=True)
    
    class Meta:
        model = Issue
        fields = ['issue_id', 'title', 'reporter', 'reporter_details', 
                 'assignee', 'assignee_details', 'category', 'category_name',
                 'priority', 'priority_name', 'status', 'status_name',
                 'college', 'college_name', 'created_at', 'updated_at',
                 'is_student_issue']
        read_only_fields = ['created_at', 'updated_at']


class IssueDetailSerializer(serializers.ModelSerializer):
    reporter_details = UserSerializer(source='reporter', read_only=True)
    assignee_details = UserSerializer(source='assignee', read_only=True)
    category_details = CategorySerializer(source='category', read_only=True)
    priority_details = PrioritySerializer(source='priority', read_only=True)
    status_details = StatusSerializer(source='status', read_only=True)
    college_name = serializers.CharField(source='college.college_name', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Issue
        fields = ['issue_id', 'title', 'description', 'reporter', 'reporter_details', 
                 'assignee', 'assignee_details', 'category', 'category_details',
                 'priority', 'priority_details', 'status', 'status_details',
                 'college', 'college_name', 'created_at', 'updated_at',
                 'due_date', 'resolved_at', 'is_student_issue',
                 'comments', 'attachments']
        read_only_fields = ['created_at', 'updated_at']


class IssueSerializer(serializers.ModelSerializer):
    reporter = UserSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    priority_name = serializers.CharField(source='priority.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False)
    priority = serializers.PrimaryKeyRelatedField(queryset=Priority.objects.all(), required=False)
    status = serializers.PrimaryKeyRelatedField(queryset=Status.objects.all(), required=False)

    class Meta:
        model = Issue
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'resolved_at', 'category_name', 'priority_name', 'status_name') 