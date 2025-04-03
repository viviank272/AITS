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
        fields = '__all__'

class ProgramSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.college_name', read_only=True)
    department_name = serializers.CharField(source='department.dept_name', read_only=True)
    
    class Meta:
        model = Program
        fields = '__all__' 