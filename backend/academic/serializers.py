from rest_framework import serializers
from .models import College, Department, Program

class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.college_name', read_only=True)
    
    class Meta:
        model = Department
        fields = ['department_id', 'dept_name', 'description', 'head_user_id', 'college', 'college_name', 'created_at', 'is_disabled']

class ProgramSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.college_name', read_only=True)
    department_name = serializers.CharField(source='department.dept_name', read_only=True)
    
    class Meta:
        model = Program
        fields = '__all__' 