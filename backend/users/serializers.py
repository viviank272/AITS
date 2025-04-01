from rest_framework import serializers
from .models import User, Role, Student
from academic.models import Department, College, Program


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['role_id', 'role_name', 'description', 'permissions']


class UserSerializer(serializers.ModelSerializer):
    role_details = RoleSerializer(source='role', read_only=True)
    department_name = serializers.CharField(source='department.dept_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['user_id', 'username', 'email', 'full_name', 'role', 'role_details', 
                 'department', 'department_name', 'user_type', 'created_at', 'last_login', 'is_active']
        read_only_fields = ['created_at', 'last_login']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    role_details = RoleSerializer(source='role', read_only=True)
    department_name = serializers.CharField(source='department.dept_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['user_id', 'username', 'email', 'full_name', 'role', 'role_details', 
                 'department', 'department_name', 'user_type', 'created_at', 'last_login']
        read_only_fields = ['user_id', 'created_at', 'last_login']


class StudentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    program_name = serializers.CharField(source='program.program_name', read_only=True)
    college_name = serializers.CharField(source='college.college_name', read_only=True)
    
    class Meta:
        model = Student
        fields = ['student_id', 'user', 'user_details', 'student_number', 'college', 'college_name',
                 'program', 'program_name', 'year_level', 'enrollment_status', 
                 'admission_date', 'expected_graduation']
        

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'full_name', 'password', 'confirm_password', 'user_type']
    
    def validate(self, data):
        if data['password'] != data.pop('confirm_password'):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class StudentRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    student_number = serializers.CharField(max_length=20)
    college_id = serializers.IntegerField()
    program_id = serializers.IntegerField()
    year_level = serializers.IntegerField()
    admission_date = serializers.DateField()
    
    def validate(self, data):
        if data['password'] != data.pop('confirm_password'):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        # Validate that college exists
        try:
            college = College.objects.get(college_id=data['college_id'])
        except College.DoesNotExist:
            raise serializers.ValidationError({"college_id": "College does not exist"})
        
        # Validate that program exists and belongs to the college
        try:
            program = Program.objects.get(program_id=data['program_id'])
            if program.college.college_id != data['college_id']:
                raise serializers.ValidationError({"program_id": "Program does not belong to the selected college"})
        except Program.DoesNotExist:
            raise serializers.ValidationError({"program_id": "Program does not exist"})
        
        return data
    
    def create(self, validated_data):
        college_id = validated_data.pop('college_id')
        program_id = validated_data.pop('program_id')
        student_number = validated_data.pop('student_number')
        year_level = validated_data.pop('year_level')
        admission_date = validated_data.pop('admission_date')
        
        # Create the user
        validated_data['user_type'] = 'student'
        user = User.objects.create_user(**validated_data)
        
        # Create the student profile
        student = Student.objects.create(
            user=user,
            student_number=student_number,
            college_id=college_id,
            program_id=program_id,
            year_level=year_level,
            enrollment_status='enrolled',
            admission_date=admission_date
        )
        
        return student 