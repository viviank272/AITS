from rest_framework import serializers
from .models import Department, Role
from django.contrib.auth.models import User
from .models import College

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['department_id', 'department_name', 'description', 'head_user_id', 'college_id', 'created_at']
        
    head_user_name = serializers.CharField(source='head_user_id.username', read_only=True)
    college_name = serializers.CharField(source='college_id.college_name', read_only=True)

    class Meta:
        model = Department
        fields = ['department_id', 'department_name', 'description', 'head_user_name', 'college_name', 'created_at']

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['role_id', 'role_name', 'description', 'permissions', 'created_at']
