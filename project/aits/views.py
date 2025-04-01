from rest_framework import viewsets, status
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model, authenticate, login
from django.core.mail import send_mail
import random
import string
from .models import Issue, Comment, Notification
from .serializer import UserRegistrationSerializer, IssueSerializer, CommentSerializer, NotificationSerializer
import logging

User = get_user_model()
logger = logging.getLogger(__name__)
# Registration View

class RegisterView(APIView):
    @csrf_exempt
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


# Login View
class LoginView(APIView):
    def post(self, request):
        logger.info("Entering LoginView.post")
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'role': user.role}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# class LoginView(APIView):
#     @csrf_exempt
#     def post(self, request):
#         logger.info(f"Request user: {request.user}, Auth: {request.auth}")
#         email = request.data.get('email')
#         password = request.data.get('password')
#         user = authenticate(request, email=email, password=password)
#         if user is not None:
#             login(request, user)
#             token, _ = Token.objects.get_or_create(user=user)
#             return Response({'token': token.key, 'role': user.role}, status=status.HTTP_200_OK)
#         return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# from rest_framework import status
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from django.core.mail import send_mail
# from .models import Issue, User
# from .serializer import IssueSerializer
# import logging

# logger = logging.getLogger(__name__)

class CreateIssueView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        logger.info("Entering CreateIssueView.post")
        logger.info(f"Request user: {request.user}, Auth: {request.auth}, Headers: {request.headers}")
        if request.user.role != 'student':
            logger.info(f"User {request.user} is not a student, role: {request.user.role}")
            return Response(
                {'error': 'Only students can create issues'},
                status=status.HTTP_403_FORBIDDEN
            )
        data = request.data.copy()
        data['student'] = request.user.id
        serializer = IssueSerializer(data=data)
        if serializer.is_valid():
            logger.info("Serializer is valid, saving issue")
            issue = serializer.save()
            try:
                head_of_department = User.objects.get(
                    role='head_of_department',
                    department=request.user.department
                )
                send_mail(
                    'New Issue Reported',
                    f'An issue has been reported by {request.user.email}.',
                    'vas@mcash.ug',
                    [head_of_department.email],
                    fail_silently=False,
                )
            except User.DoesNotExist:
                logger.info("No head of department found")
                pass
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.info(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# Create Issues View
# @method_decorator(csrf_exempt, name='dispatch')
# class CreateIssueView(APIView):
#     # permission_classes = [IsAuthenticated]

#     def post(self, request):
#         logger.info(f"Request user: {request.user}, Auth: {request.auth}")
#         if request.user.role != 'student':
#             return Response(
#                 {'error': 'Only students can create issues'},
#                 status=status.HTTP_403_FORBIDDEN
#             )
#         data = request.data.copy()
#         data['student'] = request.user.id
#         serializer = IssueSerializer(data=data)
#         if serializer.is_valid():
#             issue = serializer.save()
#             try:
#                 head_of_department = User.objects.get(
#                     role='head_of_department',
#                     department=request.user.department
#                 )
#                 send_mail(
#                     'New Issue Reported',
#                     f'An issue has been reported by {request.user.email}.',
#                     'vas@mcash.ug',
#                     [head_of_department.email],
#                     fail_silently=False,
#                 )
#             except User.DoesNotExist:
#                 pass
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class CreateIssueView(APIView):
#     permission_classes = [IsAuthenticated]  # Ensures user is logged in

#     def post(self, request):
#         # Check if the user has the 'student' role
#         logger.info(f"Request user: {request.user}, Auth: {request.auth}")
#         if request.user.role != 'student':
#             return Response(
#                 {'error': 'Only students can create issues'},
#                 status=status.HTTP_403_FORBIDDEN
#             )

#         # Add the logged-in user as the student to the request data
#         data = request.data.copy()  # Create a mutable copy of request.data
#         data['student'] = request.user.id  # Assign the current user as the student

#         # Serialize and validate the data
#         serializer = IssueSerializer(data=data)
#         if serializer.is_valid():
#             # Save the issue
#             issue = serializer.save()

#             # Find the head of department for the student's department
#             try:
#                 head_of_department = User.objects.get(
#                     role='head_of_department',
#                     department=request.user.department
#                 )
#                 # Send email to the head of department
#                 send_mail(
#                     'New Issue Reported',
#                     f'An issue has been reported by {request.user.email}.\nPlease log in to the AITS dashboard to view the details.',
#                     'vas@mcash.ug',  # Replace with your sender email
#                     [head_of_department.email],
#                     fail_silently=False,
#                 )
#             except User.DoesNotExist:
#                 # Handle case where no head of department exists
#                 pass  # Optionally log this or notify an admin

#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AssignIssueView(APIView):
    def post(self, request, pk):
        issue = Issue.objects.get(pk=pk)
        if issue.status == 'open':
            if issue.student != request.user and request.user.role == 'head_of_department':
                issue.status = 'assigned'
                issue.assigned_to = User.objects.get(role='lecturer', department=request.user.department)
                issue.save()
                send_mail(
                    'Issue Assigned',
                    f'An issue has been assigned to you.\nPlease log in to the AITS dashboard to view the details.',
                    ''
                    [issue.assigned_to.email],
                    fail_silently=False,
                )
            return Response({'message': 'Issue assigned successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'Issue is not open'}, status=status.HTTP_400_BAD_REQUEST)    
    
class ResolveIssueView(APIView):
    def post(self, request, pk):
        issue = Issue.objects.get(pk=pk)
        if issue.status == 'assigned':
            if issue.assigned_to == request.user:
                issue.status = 'resolved'
                issue.save()
                send_mail(
                    'Issue Resolved',
                    f'An issue has been resolved.\nPlease log in to the AITS dashboard to view the details.',
                    ''
                    [issue.student.email],
                    fail_silently=False,
                )
            return Response({'message': 'Issue resolved successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'Issue is not assigned'}, status=status.HTTP_400_BAD_REQUEST)

# Issue, Comment, Notification ViewSets (same as before)
class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

# Dashboard Stats (same as before)
class DashboardStats(APIView):
    def get(self, request):
        total_issues = Issue.objects.count()
        open_issues = Issue.objects.filter(status='open').count()
        assigned_issues = Issue.objects.filter(status='assigned').count()
        resolved_issues = Issue.objects.filter(status='resolved').count()
        overdue_issues = Issue.objects.filter(
            status__in=['open', 'assigned'],
            created_at__lt=timezone.now() - timedelta(days=7)
        ).count()
        return Response({
            'total_issues': total_issues,
            'open_issues': open_issues,
            'assigned_issues': assigned_issues,
            'resolved_issues': resolved_issues,
            'overdue_issues': overdue_issues,
        })