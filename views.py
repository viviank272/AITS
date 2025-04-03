from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import Department, Role
from .serializers import DepartmentSerializer, RoleSerializer
from rest_framework.decorators import action

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    @action(detail=False, methods=['get'])
    def by_college(self, request, *args, **kwargs):
        college_id = request.query_params.get('college_id')
        if college_id:
            departments = Department.objects.filter(college_id=college_id)
            serializer = DepartmentSerializer(departments, many=True)
            return Response(serializer.data)
        return Response({"error": "college_id is required"}, status=status.HTTP_400_BAD_REQUEST)

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

    @action(detail=False, methods=['get'])
    def by_permission(self, request, *args, **kwargs):
        permission = request.query_params.get('permission')
        if permission:
            roles = Role.objects.filter(permissions__contains={permission})
            serializer = RoleSerializer(roles, many=True)
            return Response(serializer.data)
        return Response({"error": "permission query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

