from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model, authenticate, login
from django.core.mail import send_mail
import random
import string
from .models import Issue, Comment, Notification
from .serializer import UserRegistrationSerializer, IssueSerializer, CommentSerializer, NotificationSerializer

User = get_user_model()



class CreateIssueView(APIView):
   # permission_classes = [IsAuthenticated]

    def post(self, request):
        # logger.info("Entering CreateIssueView.post")
        # logger.info(f"Request user: {request.user}, Auth: {request.auth}, Headers: {request.headers}")
        # if request.user.role != 'student':
        #     logger.info(f"User {request.user} is not a student, role: {request.user.role}")
        #     return Response(
        #         {'error': 'Only students can create issues'},
        #         status=status.HTTP_403_FORBIDDEN
        #     )
        data = request.data.copy()
        data['student'] = 3
        serializer = IssueSerializer(data=data)
        if serializer.is_valid():
            logger.info("Serializer is valid, saving issue")
            
            try:
                head_of_department = User.objects.get(
                    role='head_of_department',
                    department= 'COCIS'
                )
                send_mail(
                    'New Issue Reported',
                    f'An issue has been reported by aarnold.',
                    'vas@mcash.ug',
                    ['k.agaba@student.ciu.ac.ug'],
                    fail_silently=False,
                )
            except User.DoesNotExist:
                logger.info("No head of department found")
                pass
            serializer.save()
            logger.info(f"Issue created: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.info(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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


class UpdateIssueView(APIView):
    def put(self, request, pk):
        try:
            issue = Issue.objects.get(pk=pk)
        except Issue.DoesNotExist:
            return Response({'error': 'Issue not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get the current user's role
        current_user = request.user
        if not current_user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        # Status: Open → Assigned (by Head of Department)
        if issue.status == 'open' and current_user.role == 'head_of_department':
            assigned_to_id = request.data.get('assigned_to')
            if not assigned_to_id:
                return Response({'error': 'assigned_to is required to assign the issue'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                assigned_to_user = User.objects.get(id=assigned_to_id, role='lecturer')
            except User.DoesNotExist:
                return Response({'error': 'Assigned user must be a lecturer'}, status=status.HTTP_400_BAD_REQUEST)
            
            issue.status = 'assigned'
            issue.assigned_to = assigned_to_user
            issue.save()

        # Status: Assigned → Resolved (by Lecturer)
        elif issue.status == 'assigned' and current_user.role == 'lecturer':
            # Ensure the lecturer is the one assigned
            if issue.assigned_to != current_user:
                return Response({'error': 'Only the assigned lecturer can resolve this issue'}, status=status.HTTP_403_FORBIDDEN)
            
            issue.status = 'resolved'
            issue.save()

        else:
            return Response({'error': 'Invalid status transition or insufficient permissions'}, status=status.HTTP_403_FORBIDDEN)

        # Serialize and save any additional updates from request.data
        serializer = IssueSerializer(issue, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
    

# Registration View
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

# Login View
class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'role': user.role}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    

# class UpdateIssueView(APIView):
#     def put(self, request, pk):
        
        
    
#         try:
#             issue = Issue.objects.get(pk=pk)
#         except Issue.DoesNotExist:
#             return Response({'error': 'Issue not found'}, status=status.HTTP_404_NOT_FOUND)
#         if issue.status == 'assigned':
#             assigned_to_id = request.data.get('assigned_to')
#             try:
#                 assigned_to_user = User.objects.get(id=assigned_to_id, role='head_of_department')
#             except User.DoesNotExist:
#                     return Response({'error': 'Assigned user not found or invalid'}, status=status.HTTP_400_BAD_REQUEST)

#             issue.status = 'resolved'
#             issue.assigned_to = assigned_to_user
#             issue.save()
#         serializer = IssueSerializer(issue, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



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