from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import College, Department, Program
from .serializers import CollegeSerializer, DepartmentSerializer, ProgramSerializer

# Create your views here.

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_colleges(request):
    """
    List all colleges or create a new college
    """
    if request.method == 'GET':
        # Check if we should include disabled colleges
        include_disabled = request.query_params.get('include_disabled', 'false').lower() == 'true'
        if include_disabled:
            colleges = College.objects.all()
        else:
            colleges = College.objects.filter(is_disabled=False)
        serializer = CollegeSerializer(colleges, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = CollegeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def college_detail(request, pk):
    """
    Retrieve, update or delete a college
    """
    try:
        college = College.objects.get(college_id=pk)
    except College.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CollegeSerializer(college)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = CollegeSerializer(college, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        college.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_departments(request):
    """
    List all departments or create a new department
    """
    if request.method == 'GET':
        # Check if we should include disabled departments
        include_disabled = request.query_params.get('include_disabled', 'false').lower() == 'true'
        if include_disabled:
            departments = Department.objects.all()
        else:
            # Filter out disabled departments and departments from disabled colleges
            departments = Department.objects.filter(
                is_disabled=False,
                college__is_disabled=False
            )
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def department_detail(request, pk):
    """
    Retrieve, update or delete a department
    """
    try:
        department = Department.objects.get(department_id=pk)
    except Department.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = DepartmentSerializer(department)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = DepartmentSerializer(department, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        department.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_programs(request):
    """
    List all programs
    """
    programs = Program.objects.all()
    serializer = ProgramSerializer(programs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_departments_by_college(request, college_id):
    """
    Get all departments for a specific college
    """
    # Check if we should include disabled departments
    include_disabled = request.query_params.get('include_disabled', 'false').lower() == 'true'
    
    # First check if the college is disabled
    try:
        college = College.objects.get(college_id=college_id)
        if college.is_disabled and not include_disabled:
            return Response([])
    except College.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if include_disabled:
        departments = Department.objects.filter(college_id=college_id)
    else:
        departments = Department.objects.filter(
            college_id=college_id,
            is_disabled=False
        )
    
    serializer = DepartmentSerializer(departments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_programs_by_department(request, department_id):
    """
    Get all programs for a specific department
    """
    programs = Program.objects.filter(department_id=department_id)
    serializer = ProgramSerializer(programs, many=True)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def program_list_create(request):
    """
    List all programs or create a new program
    """
    if request.method == 'GET':
        # Check if we should include inactive programs
        include_inactive = request.query_params.get('include_inactive', 'false').lower() == 'true'
        if include_inactive:
            programs = Program.objects.all()
        else:
            programs = Program.objects.filter(is_active=True)
        serializer = ProgramSerializer(programs, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ProgramSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def program_detail(request, pk):
    """
    Retrieve, update or delete a program instance
    """
    try:
        program = Program.objects.get(pk=pk)
    except Program.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProgramSerializer(program)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ProgramSerializer(program, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        program.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
