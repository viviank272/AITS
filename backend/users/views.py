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
from .models import Student, User, Role
from django.utils import timezone
from .serializers import StudentSerializer, UserSerializer, RoleSerializer
import logging
from django.core.mail import send_mail
from django.conf import settings
import random
import string

# Create a logger instance
logger = logging.getLogger(__name__)

# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user and send verification email
    """
    logger.info("Received registration request")
    try:
        logger.info("Received registration request")
        data = json.loads(request.body)
        logger.info(f"Request data: {data}")
        
        email = data.get('email')
        password = data.get('password')
        firstName = data.get('firstName')
        lastName = data.get('lastName')

        if not all([email, password, firstName, lastName]):
            logger.error("Missing required fields")
            return Response(
                {"error": "All fields are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            logger.error(f"User with email {email} already exists")
            return Response(
                {"error": "Email already registered"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate verification code
        verification_code = ''.join(random.choices(string.digits, k=6))
        logger.info(f"Generated verification code: {verification_code}")

        # Create user
        try:
            user = User.objects.create_user(
                email=email,
                password=password,
                full_name=f"{firstName} {lastName}",
                user_type='student',
                verification_code=verification_code,
                is_active=False,  # User will be activated after email verification
                username=email.split('@')[0]  # Use part of email as username
            )
            logger.info(f"User created successfully: {user.email}")
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return Response(
                {"error": f"Error creating user: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Send verification email
        try:
            subject = 'Verify your email for MUK Support Portal'
            message = f'''
            Hello {firstName},

            Thank you for registering with MUK Support Portal. Please use the following code to verify your email:

            Verification Code: {verification_code}

            If you did not request this registration, please ignore this email.

            Best regards,
            MUK Support Portal Team
            '''
            from_email = settings.EMAIL_HOST_USER
            recipient_list = [email]

            logger.info(f"Sending verification email to {email}")
            send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            logger.info("Verification email sent successfully")

            return Response({
                "message": "Registration successful. Please check your email for verification code.",
                "email": email
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error sending verification email: {str(e)}")
            # Delete the user if email sending fails
            user.delete()
            return Response(
                {"error": f"Error sending verification email: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON data: {str(e)}")
        return Response(
            {"error": "Invalid JSON data"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """
    Verify user's email with the verification code
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        verification_code = data.get('verificationCode')

        if not email or not verification_code:
            return Response(
                {"error": "Email and verification code are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.verification_code != verification_code:
            return Response(
                {"error": "Invalid verification code"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Activate user
        user.is_active = True
        user.verification_code = None
        user.save()

        return Response({
            "message": "Email verified successfully. You can now login."
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    """
    Authenticate a user and return a token
    """
    logger.info(f"Login request data: {request.body}")
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not password:
            logger.error("No password provided")
            return Response(
                {"error": "Password is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not email:
            logger.error("No email provided")
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Handle login for all users
        logger.info(f"Login attempt with email: {email}")
        try:
            # First check if user exists
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                logger.error(f"User not found: {email}")
                return Response(
                    {"error": "User not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # For students, check if they have a password set
            if user.user_type == 'student':
                if not user.has_usable_password():
                    logger.info(f"Student {email} needs to set password")
                    return Response({
                        "error": "Password not set",
                        "message": "Please set your password first",
                        "needs_password": True
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Use email as username for authentication
            user = authenticate(username=email, password=password)
            if user is None:
                logger.error(f"Authentication failed for email {email}")
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            refresh = RefreshToken.for_user(user)
            logger.info(f"Login successful for email {email}")
            
            # Get student number if user is a student
            student_number = None
            if user.user_type == 'student' and hasattr(user, 'student_profile'):
                student_number = user.student_profile.student_number
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'user_id': user.user_id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.user_type,
                    'student_number': student_number
                }
            })
            
        except Exception as e:
            logger.error(f"Error during login: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON data: {str(e)}")
        return Response(
            {"error": "Invalid JSON data"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
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
    try:
        user = request.user
        logger.info(f"Fetching profile for user: {user.email}, role: {user.user_type}")
        
        # Basic user info
        profile_data = {
            "id": user.user_id,
            "email": user.email,
            "full_name": user.full_name,
            "user_type": user.user_type,
            "student_number": None,
            "registration_number": None,
            "program": None,
            "college_name": None,
            "department_name": None
        }
        
        # Try to get student profile data safely
        if hasattr(user, 'student_profile'):
            logger.info(f"Student profile found for user {user.email}")
            try:
                profile_data["student_number"] = user.student_profile.student_number
                profile_data["registration_number"] = user.student_profile.registration_number
            except Exception as e:
                logger.error(f"Error accessing student basic info: {str(e)}")
                # Continue with partial data if this fails
                pass
                
            # Safely try to get program
            try:
                has_program = hasattr(user.student_profile, 'program')
                logger.info(f"Student has program attribute: {has_program}")
                if has_program and user.student_profile.program:
                    profile_data["program"] = user.student_profile.program.program_name
                    logger.info(f"Program name retrieved: {profile_data['program']}")
            except Exception as e:
                logger.error(f"Error accessing program: {str(e)}")
                # If access fails, set to "Unknown Program"
                profile_data["program"] = "Unknown Program"
                
            # Safely try to get college
            try:
                has_college = hasattr(user.student_profile, 'college')
                logger.info(f"Student has college attribute: {has_college}")
                if has_college and user.student_profile.college:
                    profile_data["college_name"] = user.student_profile.college.college_name
                    logger.info(f"College name retrieved: {profile_data['college_name']}")
            except Exception as e:
                logger.error(f"Error accessing college: {str(e)}")
                # If access fails, set to "Unknown College"
                profile_data["college_name"] = "Unknown College"
                
            # Safely try to get department
            try:
                has_department = hasattr(user.student_profile, 'department')
                logger.info(f"Student has department attribute: {has_department}")
                if has_department and user.student_profile.department:
                    profile_data["department_name"] = user.student_profile.department.dept_name
                    logger.info(f"Department name retrieved: {profile_data['department_name']}")
            except Exception as e:
                logger.error(f"Error accessing department: {str(e)}")
                # If access fails, set to "Unknown Department"
                profile_data["department_name"] = "Unknown Department"
        
        logger.info(f"Returning profile data: {profile_data}")
        return Response(profile_data)
        
    except Exception as e:
        logger.error(f"Unexpected error in get_user_profile: {str(e)}")
        # If anything goes wrong, return a basic profile
        try:
            return Response({
                "id": request.user.user_id,
                "email": request.user.email,
                "full_name": request.user.full_name,
                "user_type": request.user.user_type,
                "student_number": None,
                "registration_number": None,
                "program": None,
                "college_name": None,
                "department_name": None
            })
        except Exception as ex:
            logger.error(f"Failed even to get basic profile: {str(ex)}")
            # Absolute fallback if we can't even get basic user data
            return Response({
                "error": "Unable to retrieve profile data"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        
        logger.info(f"Received data for student creation: {request.data}")
        
        # First create the user
        user_data = {
            'email': request.data.get('email'),
            'username': str(request.data.get('studentNumber')),  # Use student number as username
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
        
        # Get user email safely
        user_email = getattr(request.user, 'email', 'unknown')
        logger.info(f"Logout request received for user {user_email}")
        
        if refresh_token:
            try:
                # Blacklist the refresh token
                token = RefreshToken(refresh_token)
                token.blacklist()
                logger.info(f"Successfully blacklisted token for user {user_email}")
            except Exception as e:
                # If the token is invalid or expired, just log it and continue
                logger.warning(f"Failed to blacklist token for user {user_email}: {str(e)}")
        
        # Also try to blacklist the access token if available
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            try:
                access_token = auth_header.split(' ')[1]
                token = RefreshToken.for_user(request.user)
                token.blacklist()
                logger.info(f"Successfully blacklisted access token for user {user_email}")
            except Exception as e:
                logger.warning(f"Failed to blacklist access token for user {user_email}: {str(e)}")
        
        # Logout the user
        logout(request)
        logger.info(f"Successfully logged out user {user_email}")
        
        return Response({
            "message": "Successfully logged out"
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}", exc_info=True)
        return Response(
            {"error": "Logout failed"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def request_verification(request):
    """
    Send a verification request to the administrator
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        firstName = data.get('firstName')
        lastName = data.get('lastName')
        
        if not email or not firstName or not lastName:
            return Response(
                {"error": "Please provide email, first name, and last name"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate a random 6-digit code
        verification_code = str(random.randint(100000, 999999))
        
        # Send email to administrator
        subject = 'New Registration Verification Request'
        message = f"""
        A new user has requested registration:
        
        Name: {firstName} {lastName}
        Email: {email}
        
        Verification Code: {verification_code}
        
        Please verify this user and provide them with the verification code.
        """
        
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            ['amonkats8@gmail.com'],
            fail_silently=False,
        )
        
        return Response({
            "message": "Verification request sent to administrator",
            "verification_code": verification_code  # In production, this should be stored securely
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def check_student(request):
    """
    Check if a student exists and if they have a password set
    """
    logger.info(f"Received check_student request for student_number: {request.body}")
    try:
        data = json.loads(request.body)
        student_number = data.get('student_number')
        
        logger.info(f"Received check_student request for student_number: {student_number}")
        logger.info(f"Request data: {data}")

        if not student_number:
            logger.error("No student number provided")
            return Response(
                {"error": "Student number is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Try to find the student with the provided student number
            logger.info(f"Trying to find student with number: {student_number}")
            student = Student.objects.get(student_number=str(student_number).strip())
            logger.info(f"Found student: {student}")
            
            # Check if the student's user account exists and is active
            if not hasattr(student, 'user') or not student.user:
                logger.warning(f"Student {student_number} found but has no user account")
                return Response({
                    "exists": True,
                    "has_password": False,
                    "message": "Student account not properly set up. Please contact the administrator."
                })
            
            has_password = student.user.has_usable_password()
            logger.info(f"Student {student_number} has password set: {has_password}")
            
            return Response({
                "exists": True,
                "has_password": has_password,
                "email": student.user.email,
                "message": "Student found"
            })
            
        except Student.DoesNotExist:
            logger.warning(f"Student not found with number: {student_number}")
            # Let's check what student numbers exist in the database
            all_students = Student.objects.all().values_list('student_number', flat=True)
            logger.info(f"All student numbers in database: {list(all_students)}")
            return Response({
                "exists": False,
                "has_password": False,
                "message": "Student number not found. Please check your number or contact the administrator."
            })

    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON data: {str(e)}")
        return Response(
            {"error": "Invalid request data format"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error checking student: {str(e)}", exc_info=True)
        return Response(
            {"error": "An error occurred while checking the student number. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def set_student_password(request):
    """
    Set password for a student
    """
    logger.info(f"Received set_student_password request for email: {request.body}")
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is a student
        if user.user_type != 'student':
            return Response(
                {"error": "Only students can set their password through this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Set the password
        user.set_password(password)
        user.save()
        
        logger.info(f"Password set successfully for student {email}")
        return Response({
            "message": "Password set successfully. You can now login."
        })
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON data: {str(e)}")
        return Response(
            {"error": "Invalid JSON data"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error setting password: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_lecturers_and_admins(request):
    """
    List all users who are either lecturers or admins
    """
    users = User.objects.filter(user_type__in=['lecturer', 'admin'], is_active=True)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_all_users(request):
    """
    List all users
    """
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

# Role management API endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_roles(request):
    """
    List all roles
    """
    roles = Role.objects.all()
    # Add user count for each role
    roles_data = []
    for role in roles:
        role_data = RoleSerializer(role).data
        role_data['user_count'] = role.users.count()
        roles_data.append(role_data)
    
    return Response(roles_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_role(request):
    """
    Create a new role
    """
    serializer = RoleSerializer(data=request.data)
    if serializer.is_valid():
        role = serializer.save()
        # Add user count
        response_data = serializer.data
        response_data['user_count'] = 0
        return Response(response_data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def role_detail(request, role_id):
    """
    Retrieve, update or delete a role
    """
    try:
        role = Role.objects.get(role_id=role_id)
    except Role.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = RoleSerializer(role)
        response_data = serializer.data
        response_data['user_count'] = role.users.count()
        return Response(response_data)
    
    elif request.method == 'PUT':
        serializer = RoleSerializer(role, data=request.data)
        if serializer.is_valid():
            serializer.save()
            response_data = serializer.data
            response_data['user_count'] = role.users.count()
            return Response(response_data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Check if role has users
        if role.users.exists():
            return Response(
                {"error": f"Cannot delete role. It has {role.users.count()} associated users."},
                status=status.HTTP_400_BAD_REQUEST
            )
        role.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
