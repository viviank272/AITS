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

# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user
    """
    # This is a placeholder for now
    return Response({"message": "User registration endpoint"}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    """
    Authenticate a user and return a token
    """
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
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": {
                "id": user.user_id,
                "email": user.email,
                "full_name": user.full_name,
                "user_type": user.user_type
            }
        })
        
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_students(request):
    """
    List all students (for admin/staff)
    """
    return Response({"message": "List students endpoint"}, status=status.HTTP_200_OK)

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
