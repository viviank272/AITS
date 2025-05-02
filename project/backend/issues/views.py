from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Issue, Category, Priority, Status, Attachment
from .serializers import (
    IssueSerializer, CategorySerializer, PrioritySerializer, 
    StatusSerializer, AttachmentSerializer, IssueListSerializer,
    IssueDetailSerializer
)

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
    # Fetch issues where lecturer is reporter or assignee
    issues = Issue.objects.filter(reporter=request.user) | Issue.objects.filter(assignee=request.user)
    serializer = IssueListSerializer(issues, many=True)
    return Response(serializer.data)

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
    issue = get_object_or_404(Issue, pk=pk)
    serializer = IssueSerializer(issue, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
