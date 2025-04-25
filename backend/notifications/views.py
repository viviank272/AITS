from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from issues.models import Notification, Issue
from users.models import User

# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_notifications(request):
    """
    Get notifications for the current student
    """
    try:
        notifications = Notification.objects.filter(
            user=request.user,
            issue__reporter=request.user
        ).order_by('-created_at')
        
        # Format the notifications for the frontend
        formatted_notifications = [{
            'id': notification.notification_id,
            'title': notification.type,
            'message': notification.message,
            'type': 'info',
            'timestamp': notification.created_at.strftime('%Y-%m-%d %I:%M %p'),
            'read': notification.is_read
        } for notification in notifications]
        
        return Response(formatted_notifications)
    except Exception as e:
        print(f"Error fetching student notifications: {str(e)}")
        return Response(
            {"error": f"An error occurred while fetching notifications: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """
    Mark a notification as read
    """
    try:
        notification = get_object_or_404(Notification, notification_id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({"message": "Notification marked as read"})
    except Exception as e:
        print(f"Error marking notification as read: {str(e)}")
        return Response(
            {"error": f"An error occurred while marking notification as read: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """
    Mark all notifications as read for the current user
    """
    try:
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read"})
    except Exception as e:
        print(f"Error marking all notifications as read: {str(e)}")
        return Response(
            {"error": f"An error occurred while marking all notifications as read: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_notifications(request):
    """
    Get all notifications for the current user
    """
    try:
        notifications = Notification.objects.filter(
            user=request.user
        ).order_by('-created_at')
        
        # Format the notifications for the frontend
        formatted_notifications = [{
            'id': notification.notification_id,
            'title': notification.type,
            'message': notification.message,
            'type': 'info',
            'timestamp': notification.created_at.strftime('%Y-%m-%d %I:%M %p'),
            'read': notification.is_read
        } for notification in notifications]
        
        return Response(formatted_notifications)
    except Exception as e:
        print(f"Error fetching all notifications: {str(e)}")
        return Response(
            {"error": f"An error occurred while fetching notifications: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_notification(request):
    """
    Create a new notification
    """
    try:
        # Get the required data from the request
        issue_id = request.data.get('issue')
        user_id = request.data.get('user')
        notification_type = request.data.get('type')
        message = request.data.get('message')
        
        # Validate required fields
        if not all([issue_id, user_id, notification_type, message]):
            return Response(
                {"error": "Missing required fields. Required: issue, user, type, message"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the issue and user objects
        try:
            issue = Issue.objects.get(issue_id=issue_id)
            user = User.objects.get(user_id=user_id)
        except (Issue.DoesNotExist, User.DoesNotExist) as e:
            return Response(
                {"error": f"Invalid issue or user ID: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the notification
        notification = Notification.objects.create(
            issue=issue,
            user=user,
            type=notification_type,
            message=message,
            is_read=False
        )
        
        # Format the response
        response_data = {
            'id': notification.notification_id,
            'title': notification.type,
            'message': notification.message,
            'type': 'info',
            'timestamp': notification.created_at.strftime('%Y-%m-%d %I:%M %p'),
            'read': notification.is_read
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error creating notification: {str(e)}")
        return Response(
            {"error": f"An error occurred while creating notification: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
