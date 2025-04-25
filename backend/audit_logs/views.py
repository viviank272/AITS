from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from django.utils.timezone import now, timedelta
from django.db.models import Q
import logging
import csv
from django.http import HttpResponse

from .models import AuditLog
from .serializers import AuditLogSerializer

logger = logging.getLogger(__name__)

class IsAdminOrStaff(permissions.BasePermission):
    """
    Custom permission to only allow admin or staff users to access audit logs
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if user is admin
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # Check if user has admin role
        try:
            # First check user_type field
            if hasattr(request.user, 'user_type') and request.user.user_type in ['admin']:
                return True
                
            # Then check role relationship if it exists
            user_role = getattr(request.user, 'role', None)
            if user_role:
                if hasattr(user_role, 'role_name') and user_role.role_name in ['admin']:
                    return True
                elif hasattr(user_role, 'permissions') and user_role.permissions:
                    # Check if the user has a role with audit log permissions
                    permissions = user_role.permissions
                    if isinstance(permissions, dict) and permissions.get('audit_logs', {}).get('read', False):
                        return True
                        
        except Exception as e:
            logger.error(f"Error checking permissions: {str(e)}", exc_info=True)
            
        return False

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for audit logs.
    Only provides read access - audit logs cannot be modified through the API.
    """
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff]
    
    def get_queryset(self):
        queryset = AuditLog.objects.all()
        
        # Filter by search term if provided
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(action__icontains=search) | 
                Q(details__icontains=search) |
                Q(user__full_name__icontains=search) |
                Q(user__email__icontains=search)
            )
        
        # Filter by type if provided
        log_type = self.request.query_params.get('type', None)
        if log_type and log_type != 'all':
            queryset = queryset.filter(type=log_type)
        
        # Filter by user if provided
        user_id = self.request.query_params.get('user', None)
        if user_id and user_id != 'all':
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by date range if provided
        date_range = self.request.query_params.get('date_range', 'week')
        if date_range == 'day':
            queryset = queryset.filter(timestamp__gte=now() - timedelta(days=1))
        elif date_range == 'week':
            queryset = queryset.filter(timestamp__gte=now() - timedelta(days=7))
        elif date_range == 'month':
            queryset = queryset.filter(timestamp__gte=now() - timedelta(days=30))
        elif date_range == 'year':
            queryset = queryset.filter(timestamp__gte=now() - timedelta(days=365))
        
        # Limit the number of records for performance
        return queryset.select_related('user')[:1000]
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        Export audit logs as CSV
        """
        queryset = self.get_queryset()
        
        # Create the HttpResponse object with CSV headers
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="audit_logs.csv"'
        
        fieldnames = ['ID', 'Timestamp', 'User', 'Action', 'Details', 'IP Address', 'Type']
        writer = csv.DictWriter(response, fieldnames=fieldnames)
        writer.writeheader()
        
        for log in queryset:
            writer.writerow({
                'ID': log.id,
                'Timestamp': log.timestamp,
                'User': log.user.full_name if log.user else 'Unknown',
                'Action': log.action,
                'Details': log.details,
                'IP Address': log.ip_address,
                'Type': log.type
            })
        
        return response
