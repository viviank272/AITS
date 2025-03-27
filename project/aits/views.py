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