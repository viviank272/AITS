from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import json
from .models import Student
from django.utils import timezone
from .serializers import StudentSerializer
import logging

# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user
    """
    # This is a placeholder for now
    return Response({"message": "User registration endpoint"}, status=status.HTTP_200_OK)
    
class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            # Generate random password
            password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
            user = serializer.save()
            user.set_password(password)  # Hash the password
            user.save()

            # Send email with password
            send_mail(
                'Welcome to AITS - Your Login Credentials',
                f'Your account has been created.\nEmail: {user.email}\nPassword: {password}\nPlease log in and change your password.',
                'from@example.com',
                [user.email],
                fail_silently=False,
            )

            return Response({'message': 'Registration successful! Check your email for login credentials.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST', 'OPTIONS'])
@permission_classes([AllowAny])
def user_login(request):
    """
    Authenticate a user and return a token
    """
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = Response()
        response['Access-Control-Allow-Origin'] = 'https://mak-issue-tracker.vercel.app'
        response['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response
        
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return Response(
                {"error": "Please provide both email and password"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=email, password=password)
        
        if user is None:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Block lecturer@muk.ac.ug from logging in
        if email == 'lecturer@muk.ac.ug':
            return Response(
                {"error": "Your account has been temporarily disabled. Please contact the administrator."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        response = Response({
            "token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": {
                "id": user.user_id,
                "email": user.email,
                "full_name": user.full_name,
                "user_type": user.user_type
            }
        })
        
        # Add CORS headers
        response['Access-Control-Allow-Origin'] = 'https://mak-issue-tracker.vercel.app'
        response['Access-Control-Allow-Credentials'] = 'true'
        
        return response
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get the user profile for the authenticated user
    """
    user = request.user
    return Response({
        "id": user.user_id,
        "email": user.email,
        "full_name": user.full_name,
        "user_type": user.user_type,
        "student_number": getattr(user.student_profile, 'student_number', None) if hasattr(user, 'student_profile') else None,
        "registration_number": getattr(user.student_profile, 'registration_number', None) if hasattr(user, 'student_profile') else None,
        "program": user.student_profile.program.program_name if hasattr(user, 'student_profile') and user.student_profile.program else None
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_students(request):
    """
    List all students (for admin/staff) or create a new student
    """
    # Check if user is admin or staff
    if not request.user.is_staff and request.user.user_type != 'admin':
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        # Get all students
        students = Student.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Create a new student
        from .models import User
        
        logger = logging.getLogger(__name__)
        logger.info(f"Received data for student creation: {request.data}")
        
        # First create the user
        user_data = {
            'email': request.data.get('email'),
            'username': request.data.get('email').split('@')[0],  # Use part of email as username
            'full_name': request.data.get('name'),
            'user_type': 'student',
            'password': 'defaultpassword'  # Set a default password
        }
        
        logger.info(f"Creating user with data: {user_data}")
        
        try:
            # Create user
            user = User.objects.create_user(**user_data)
            logger.info(f"User created successfully with ID: {user.user_id}")
            
            # Calculate current_semester
            year_level = int(request.data.get('year', 1))
            semester_in_year = int(request.data.get('semester', 1))
            current_semester = ((year_level - 1) * 2) + semester_in_year
            
            # Debug values for college, department, program
            logger.info(f"Looking up college: {request.data.get('college')}")
            logger.info(f"Looking up department: {request.data.get('department')}")
            logger.info(f"Looking up program: {request.data.get('program')}")
            
            # Create student profile
            student = Student.objects.create(
                user=user,
                student_number=int(request.data.get('studentNumber')),
                registration_number=request.data.get('regNumber'),
                college_id=get_college_id(request.data.get('college')),
                department_id=get_department_id(request.data.get('department')),
                program_id=get_program_id(request.data.get('program')),
                year_level=year_level,
                semester_in_year=semester_in_year,
                current_semester=current_semester,
                enrollment_status=request.data.get('status', 'enrolled'),
                admission_date=timezone.now().date()  # Use current date as admission date
            )
            logger.info(f"Student created successfully with ID: {student.student_id}")
            
            serializer = StudentSerializer(student)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating student: {str(e)}", exc_info=True)
            # If user was created but student creation failed, clean up the user
            if 'user' in locals():
                logger.info(f"Cleaning up user {user.user_id} due to student creation failure")
                user.delete()
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def student_detail(request, student_id):
    """
    Retrieve, update or delete a student instance
    """
    # Check if user is admin or staff
    if not request.user.is_staff and request.user.user_type != 'admin':
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        student = Student.objects.get(student_id=student_id)
    except Student.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = StudentSerializer(student)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Update student details
        try:
            # Update basic student info
            if 'studentNumber' in request.data:
                student.student_number = int(request.data.get('studentNumber'))
            if 'regNumber' in request.data:
                student.registration_number = request.data.get('regNumber')
            if 'college' in request.data:
                student.college_id = get_college_id(request.data.get('college'))
            if 'department' in request.data:
                student.department_id = get_department_id(request.data.get('department'))
            if 'program' in request.data:
                student.program_id = get_program_id(request.data.get('program'))
            if 'year' in request.data:
                student.year_level = int(request.data.get('year'))
            if 'semester' in request.data:
                student.semester_in_year = int(request.data.get('semester'))
            if 'status' in request.data:
                student.enrollment_status = request.data.get('status')
            
            # Recalculate current_semester
            if 'year' in request.data or 'semester' in request.data:
                student.current_semester = ((student.year_level - 1) * 2) + student.semester_in_year
            
            student.save()
            
            # Update user info if provided
            user = student.user
            if 'name' in request.data:
                user.full_name = request.data.get('name')
            if 'email' in request.data:
                user.email = request.data.get('email')
                # Update username based on email if it's not explicitly set
                user.username = request.data.get('email').split('@')[0]
            
            user.save()
            
            serializer = StudentSerializer(student)
            return Response(serializer.data)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Delete the student's user account too
        user = student.user
        user.delete()  # This will cascade delete the student due to OneToOneField relationship
        return Response(status=status.HTTP_204_NO_CONTENT)

def get_college_id(college_name):
    """Helper function to get college ID from name"""
    from academic.models import College
    try:
        # First try an exact match
        college = College.objects.get(college_name=college_name)
        return college.college_id
    except College.DoesNotExist:
        # Try a case-insensitive match
        try:
            college = College.objects.filter(college_name__iexact=college_name).first()
            if college:
                return college.college_id
            
            # Try a contains match
            college = College.objects.filter(college_name__icontains=college_name).first()
            if college:
                return college.college_id
                
            raise ValueError(f"College '{college_name}' does not exist")
        except Exception as e:
            raise ValueError(f"College '{college_name}' does not exist: {str(e)}")

def get_department_id(department_name):
    """Helper function to get department ID from name"""
    from academic.models import Department
    try:
        # First try an exact match
        department = Department.objects.get(dept_name=department_name)
        return department.department_id
    except Department.DoesNotExist:
        # Try a case-insensitive match
        try:
            department = Department.objects.filter(dept_name__iexact=department_name).first()
            if department:
                return department.department_id
            
            # Try a contains match
            department = Department.objects.filter(dept_name__icontains=department_name).first()
            if department:
                return department.department_id
                
            raise ValueError(f"Department '{department_name}' does not exist")
        except Exception as e:
            raise ValueError(f"Department '{department_name}' does not exist: {str(e)}")

def get_program_id(program_name):
    """Helper function to get program ID from name"""
    from academic.models import Program
    try:
        # First try an exact match
        program = Program.objects.get(program_name=program_name)
        return program.program_id
    except Program.DoesNotExist:
        # Try a case-insensitive match
        try:
            program = Program.objects.filter(program_name__iexact=program_name).first()
            if program:
                return program.program_id
            
            # Try a contains match
            program = Program.objects.filter(program_name__icontains=program_name).first()
            if program:
                return program.program_id
                
            raise ValueError(f"Program '{program_name}' does not exist")
        except Exception as e:
            raise ValueError(f"Program '{program_name}' does not exist: {str(e)}")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    """
    Logout the user and invalidate their token
    """
    try:
        # Get the refresh token from the request
        refresh_token = request.data.get('refresh_token')
        
        if refresh_token:
            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        # Logout the user
        logout(request)
        
        return Response({
            "message": "Successfully logged out"
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
