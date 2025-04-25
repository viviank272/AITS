from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from .models import Issue, Category, Priority, Status, Attachment, Comment, Notification
from .serializers import (
    IssueSerializer, CategorySerializer, PrioritySerializer, 
    StatusSerializer, AttachmentSerializer, IssueListSerializer,
    IssueDetailSerializer, CommentSerializer
)
from django.db.models import Case, When, F, Value
from django.db.models.functions import Coalesce

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_issues(request):
    """
    List all issues
    """
    issues = Issue.objects.all()
    serializer = IssueListSerializer(issues, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_student_issues(request):
    """
    List issues for students (only their own issues)
    """
    # Fetch issues where the student is the reporter
    issues = Issue.objects.filter(reporter=request.user)
    serializer = IssueListSerializer(issues, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_lecturer_issues(request):
    """
    List issues for lecturers (their own plus assigned)
    """
    try:
        print(f"Fetching issues for lecturer: {request.user.user_id}")
        
        # Base query for issues where lecturer is reporter or assignee
        issues = Issue.objects.filter(reporter=request.user) | Issue.objects.filter(assignee=request.user)
        
        # Apply filters
        priority = request.query_params.get('priority', None)
        if priority:
            try:
                # Handle critical priority case
                if priority.lower() == 'critical':
                    # Get the highest priority level
                    highest_priority = Priority.objects.order_by('-level').first()
                    if highest_priority:
                        print(f"Filtering for critical priority (level {highest_priority.level})")
                        issues = issues.filter(priority=highest_priority)
                        # Order by creation date for critical issues
                        issues = issues.order_by('-created_at')
                else:
                    priority_obj = Priority.objects.get(name__iexact=priority)
                    issues = issues.filter(priority=priority_obj)
            except Priority.DoesNotExist:
                print(f"Priority {priority} not found")
                pass
        
        # Filter by assigned issues
        assigned = request.query_params.get('assigned', None)
        if assigned:
            issues = issues.filter(assignee=request.user)
        
        # Filter by department issues
        department = request.query_params.get('department', None)
        if department and hasattr(request.user, 'department') and request.user.department:
            try:
                issues = issues.filter(college=request.user.department.college)
            except AttributeError:
                print("Department or college not accessible")
                pass
        
        # Filter by resolved issues
        resolved = request.query_params.get('resolved', None)
        if resolved:
            issues = issues.filter(status__name__iexact='resolved')
        
        # Apply ordering if specified
        ordering = request.query_params.get('ordering', None)
        if ordering:
            try:
                # Handle special case for resolved_at ordering
                if ordering == '-resolved_at':
                    # For resolved issues, order by resolved_at, for others use updated_at
                    issues = issues.annotate(
                        sort_date=Case(
                            When(status__name__iexact='resolved', then=F('resolved_at')),
                            default=F('updated_at'),
                            output_field=models.DateTimeField(),
                        )
                    ).order_by('-sort_date')
                else:
                    issues = issues.order_by(ordering)
            except Exception as e:
                print(f"Error applying ordering: {e}")
                # Fall back to default ordering
                issues = issues.order_by('-priority__level', '-created_at')
        else:
            # Default ordering by priority level (critical first) and creation date
            issues = issues.order_by('-priority__level', '-created_at')
        
        # Apply limit if specified (after ordering)
        limit = request.query_params.get('limit', None)
        if limit:
            try:
                limit = int(limit)
                issues = issues[:limit]
            except ValueError:
                print(f"Invalid limit value: {limit}")
                pass
        
        # Log the issues being returned
        print(f"Found {issues.count()} issues for lecturer")
        for issue in issues:
            print(f"Issue {issue.issue_id}: assignee={issue.assignee}, reporter={issue.reporter}, priority={issue.priority.name if issue.priority else 'None'}")
        
        # Serialize the issues
        serializer = IssueListSerializer(issues, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        print(f"Error in list_lecturer_issues: {str(e)}")
        return Response(
            {"error": f"An error occurred while fetching issues: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_issue(request):
    """
    Create a new issue
    """
    # Get the attachments IDs from the request data
    attachment_ids = request.data.pop('attachments', [])
    
    serializer = IssueSerializer(data=request.data)
    if serializer.is_valid():
        print(f"Creating issue with validated data: {serializer.validated_data}")
        
        # Set default status to "Open" if not provided
        # First, try to find the "Open" status, or fallback to "New" status
        default_status = None
        try:
            default_status = Status.objects.get(name="Open")
            print(f"Found Open status: {default_status.status_id}")
        except Status.DoesNotExist:
            try:
                default_status = Status.objects.get(name="New")
                print(f"Found New status: {default_status.status_id}")
            except Status.DoesNotExist:
                print("No default status found")
                pass
        
        # Set priority based on category if not provided
        default_priority = None
        if not request.data.get('priority') and serializer.validated_data.get('category'):
            category = serializer.validated_data['category']
            category_name = category.name
            print(f"Setting priority based on category: {category_name} (ID: {category.category_id})")
            
            # Print all available categories first
            all_categories = Category.objects.all()
            print("All available categories:")
            for cat in all_categories:
                print(f"  - ID: {cat.category_id}, Name: {cat.name}")
            
            # Updated priority mapping with exact case matching
            priority_mapping = {
                'Academic': 'High',
                'academic': 'High',
                'ACADEMIC': 'High',
                'Administrative': 'Critical',
                'administrative': 'Critical',
                'ADMINISTRATIVE': 'Critical',
                'Technical Support': 'High',
                'technical support': 'High',
                'Registration': 'Medium',
                'registration': 'Medium',
                'General': 'Low',
                'general': 'Low',
                'Grading': 'High',
                'grading': 'High',
                'Financial': 'Medium',
                'financial': 'Medium',
                'Library': 'Low',
                'library': 'Low',
                'IT Services': 'High',
                'it services': 'High',
                'Campus Security': 'Critical',
                'campus security': 'Critical',
                'Facilities': 'Medium',
                'facilities': 'Medium'
            }
            
            # First try exact match, then case-insensitive match
            priority_level = priority_mapping.get(category_name)
            if not priority_level:
                # Try lowercase version
                priority_level = priority_mapping.get(category_name.lower())
                
            # Default to Medium if still no match
            if not priority_level:
                print(f"No priority mapping found for '{category_name}', defaulting to 'Medium'")
                priority_level = 'Medium'
            else:
                print(f"Mapped '{category_name}' to priority level: '{priority_level}'")
            
            # Print all available priorities
            all_priorities = Priority.objects.all()
            print("All available priorities:")
            for p in all_priorities:
                print(f"  - ID: {p.priority_id}, Name: {p.name}, Level: {p.level}")
                
            try:
                # Try case-insensitive match first
                default_priority = Priority.objects.filter(name__iexact=priority_level).first()
                if default_priority:
                    print(f"Found priority by case-insensitive name: {default_priority.priority_id} - {default_priority.name}")
                else:
                    # Fall back to exact match
                    default_priority = Priority.objects.get(name=priority_level)
                    print(f"Found priority by exact name: {default_priority.priority_id} - {default_priority.name}")
            except Priority.DoesNotExist:
                # If exact priority not found, try to find by level (1=Low, 2=Medium, 3=High, 4=Critical)
                print(f"Priority '{priority_level}' not found by name, trying by level")
                level_mapping = {'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4}
                level = level_mapping.get(priority_level, 2)
                print(f"Looking for priority with level: {level}")
                
                try:
                    default_priority = Priority.objects.filter(level=level).first()
                    if default_priority:
                        print(f"Found priority by level: {default_priority.priority_id} - {default_priority.name}")
                    else:
                        print("No priority found by level")
                        # If still no match, use first priority with matching name substring
                        print("Trying partial name match...")
                        for p in all_priorities:
                            if priority_level.lower() in p.name.lower():
                                default_priority = p
                                print(f"Found priority by partial name: {default_priority.priority_id} - {default_priority.name}")
                                break
                        
                        # Last resort: just use the first priority
                        if not default_priority:
                            default_priority = Priority.objects.first()
                            if default_priority:
                                print(f"Using first available priority: {default_priority.priority_id} - {default_priority.name}")
                            else:
                                print("No priorities available in the system")
                except Exception as e:
                    print(f"Error finding priority by level: {e}")
                    # Last resort: just use the first priority
                    default_priority = Priority.objects.first()
                    if default_priority:
                        print(f"Using first available priority: {default_priority.priority_id} - {default_priority.name}")
                    else:
                        print("No priorities available in the system")
        
        # Special case handling for Academic and Administrative
        if serializer.validated_data.get('category'):
            category_name = serializer.validated_data['category'].name.lower()
            
            # Force Academic to High and Administrative to Critical
            if 'academic' in category_name:
                high_priority = Priority.objects.filter(name__icontains='high').first()
                if high_priority:
                    default_priority = high_priority
                    print(f"Special case: Academic category detected, forcing High priority: {default_priority.name}")
            
            elif 'admin' in category_name:
                critical_priority = Priority.objects.filter(name__icontains='critical').first()
                if critical_priority:
                    default_priority = critical_priority
                    print(f"Special case: Administrative category detected, forcing Critical priority: {default_priority.name}")
        
        # Save the issue with the current user as reporter, default status and priority
        save_kwargs = {
            'reporter': request.user,
        }
        
        if default_status:
            save_kwargs['status'] = default_status
            
        if default_priority:
            save_kwargs['priority'] = default_priority
            
        print(f"Saving issue with: {save_kwargs}")
        issue = serializer.save(**save_kwargs)
        print(f"Issue saved with ID: {issue.issue_id}")
        
        # Link the attachments to the issue
        if attachment_ids:
            attachments = Attachment.objects.filter(attachment_id__in=attachment_ids, issue__isnull=True)
            for attachment in attachments:
                attachment.issue = issue
                attachment.save()
        
        # Use IssueDetailSerializer for response to include related fields
        response_serializer = IssueDetailSerializer(issue)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    print(f"Validation errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_issue_detail(request, pk):
    """
    Get a single issue by ID
    """
    issue = get_object_or_404(Issue, pk=pk)
    serializer = IssueDetailSerializer(issue)
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_issue(request, pk):
    """
    Update an issue
    """
    try:
        issue = get_object_or_404(Issue, pk=pk)
        print(f"Updating issue {pk} with data: {request.data}")
        
        # Special handling for assignee updates
        if 'assignee' in request.data:
            assignee_id = request.data.get('assignee')
            print(f"Assignee update requested. Raw value: {assignee_id!r}")
            
            # If empty string, None, or "null" string, clear the assignee
            if assignee_id == "" or assignee_id is None or assignee_id == "null":
                print("Clearing assignee")
                issue.assignee = None
            else:
                # Try to find the user
                from users.models import User
                try:
                    # Convert assignee_id to integer if it's a string
                    if isinstance(assignee_id, str) and assignee_id.isdigit():
                        assignee_id = int(assignee_id)
                        
                    print(f"Looking for user with ID: {assignee_id}")
                    assignee = User.objects.get(user_id=assignee_id)
                    print(f"Found assignee: {assignee.full_name} (ID: {assignee.user_id})")
                    issue.assignee = assignee
                except User.DoesNotExist:
                    print(f"Assignee with ID {assignee_id} not found")
                    return Response(
                        {"error": f"User with ID {assignee_id} not found"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                except ValueError as e:
                    print(f"Invalid assignee ID format: {assignee_id}, Error: {e}")
                    return Response(
                        {"error": f"Invalid assignee ID format: {assignee_id}"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Save the assignee change directly
            issue.save(update_fields=['assignee'])
            print(f"Assignee updated to: {issue.assignee}")
        
        # Special handling for status updates
        if 'status' in request.data:
            status_id = request.data.get('status')
            print(f"Status update requested. Raw value: {status_id!r}")
            
            try:
                # Convert status_id to integer if it's a string
                if isinstance(status_id, str) and status_id.isdigit():
                    status_id = int(status_id)
                    
                print(f"Looking for status with ID: {status_id}")
                new_status = Status.objects.get(status_id=status_id)
                print(f"Found status: {new_status.name} (ID: {new_status.status_id})")
                
                # Update resolved_at if status is terminal
                if new_status.is_terminal and not issue.resolved_at:
                    from django.utils import timezone
                    issue.resolved_at = timezone.now()
                    print(f"Setting resolved_at to: {issue.resolved_at}")
                
                issue.status = new_status
                issue.save(update_fields=['status', 'resolved_at'])
                print(f"Status updated to: {issue.status.name}")
            except Status.DoesNotExist:
                print(f"Status with ID {status_id} not found")
                return Response(
                    {"error": f"Status with ID {status_id} not found"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            except ValueError as e:
                print(f"Invalid status ID format: {status_id}, Error: {e}")
                return Response(
                    {"error": f"Invalid status ID format: {status_id}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Process other fields with serializer
        serializer = IssueDetailSerializer(issue, data=request.data, partial=True)
        if serializer.is_valid():
            updated_issue = serializer.save()
            # Return the detailed representation
            response = IssueDetailSerializer(updated_issue).data
            print(f"Issue updated successfully with fields: {request.data.keys()}")
            return Response(response)
        else:
            print(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Error updating issue: {str(e)}")
        return Response(
            {"error": f"Failed to update issue: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_issue(request, pk):
    """
    Delete an issue
    """
    issue = get_object_or_404(Issue, pk=pk)
    issue.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_categories(request):
    """
    List all categories
    """
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_priorities(request):
    """
    List all priorities
    """
    priorities = Priority.objects.all()
    serializer = PrioritySerializer(priorities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_statuses(request):
    """
    List all statuses
    """
    statuses = Status.objects.all()
    serializer = StatusSerializer(statuses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_category_distribution(request):
    """
    Get distribution of issues by category
    """
    try:
        # Get time range from query params (default to 7 days)
        time_range = int(request.query_params.get('time_range', 7))
        
        # Calculate the date threshold
        from django.utils import timezone
        from datetime import timedelta
        threshold_date = timezone.now() - timedelta(days=time_range)
        
        # Get all categories
        categories = Category.objects.all()
        
        # Initialize result list
        distribution = []
        
        for category in categories:
            # Count issues for this category within the time range
            count = Issue.objects.filter(
                category=category,
                created_at__gte=threshold_date
            ).count()
            
            distribution.append({
                'category_id': category.category_id,
                'category_name': category.name,
                'count': count
            })
        
        return Response({
            'results': distribution
        })
        
    except Exception as e:
        return Response(
            {"error": f"An error occurred while fetching category distribution: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stats(request):
    """
    Get statistics for the lecturer dashboard
    """
    try:
        from django.utils import timezone
        from datetime import timedelta
        
        # Get the current user
        user = request.user
        
        # Calculate date thresholds
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        
        # Get assigned issues count
        assigned_count = Issue.objects.filter(assignee=user).count()
        
        # Calculate response rate (issues responded to within 24 hours)
        total_issues = Issue.objects.filter(assignee=user).count()
        responded_issues = Issue.objects.filter(
            assignee=user,
            created_at__lte=now - timedelta(hours=24)
        ).exclude(
            comments__isnull=True
        ).distinct().count()
        
        response_rate = (responded_issues / total_issues * 100) if total_issues > 0 else 0
        
        # Get resolved issues this week
        resolved_this_week = Issue.objects.filter(
            assignee=user,
            status__name__iexact='resolved',
            resolved_at__gte=week_ago
        ).count()
        
        # Get SLA breaches (issues past due date)
        sla_breaches = Issue.objects.filter(
            assignee=user,
            due_date__lt=now,
            status__name__in=['open', 'pending', 'in_progress']
        ).count()
        
        return Response({
            'assigned': assigned_count,
            'responseRate': round(response_rate, 1),
            'resolvedThisWeek': resolved_this_week,
            'slaBreaches': sla_breaches
        })
        
    except Exception as e:
        return Response(
            {"error": f"An error occurred while fetching stats: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_attachment(request):
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

    file_obj = request.FILES['file']
    
    # Create attachment without linking to an issue yet
    attachment = Attachment.objects.create(
        user=request.user,
        file_name=file_obj.name,
        file_path=file_obj,
        file_type=file_obj.content_type,
        file_size=file_obj.size
    )
    
    serializer = AttachmentSerializer(attachment)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def issue_comments(request, pk):
    """
    Handle both getting and posting comments for an issue
    """
    issue = get_object_or_404(Issue, pk=pk)
    
    if request.method == 'GET':
        comments = Comment.objects.filter(issue=issue)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Add the current user and issue to the comment data
        comment_data = request.data.copy()
        comment_data['user'] = request.user.user_id
        comment_data['issue'] = issue.issue_id
        
        serializer = CommentSerializer(data=comment_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_category(request):
    """
    Create a new category
    """
    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def update_category(request, pk):
    """
    Update a category
    """
    try:
        category = Category.objects.get(category_id=pk)
    except Category.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = CategorySerializer(category)
        return Response(serializer.data)
    
    serializer = CategorySerializer(category, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_category(request, pk):
    """
    Delete a category
    """
    try:
        category = Category.objects.get(category_id=pk)
    except Category.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    # Check if the category has associated issues
    issue_count = category.issues.count()
    if issue_count > 0:
        return Response(
            {"error": f"Cannot delete category. It has {issue_count} associated issues."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    category.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

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
