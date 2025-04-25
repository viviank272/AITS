import logging
import re
from django.urls import resolve
from .utils import log_audit_event

logger = logging.getLogger(__name__)

# Paths and actions to be logged
AUDIT_PATH_PATTERNS = [
    (r'^/api/users/(?!login|register)', 'User Management'),
    (r'^/api/issues/', 'Issue Management'),
    (r'^/api/academic/', 'Academic Management'),
    (r'^/api/admin/', 'Admin Action'),
    (r'^/api/audit-logs/', 'Audit Log Access')
]

class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Only audit authenticated requests
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Don't log GET requests or OPTIONS requests
            if request.method not in ['GET', 'OPTIONS'] and response.status_code < 500:
                path = request.path
                
                # Check if the path matches any audit patterns
                for pattern, action_prefix in AUDIT_PATH_PATTERNS:
                    if re.match(pattern, path):
                        # Extract the action from the request
                        action = self._extract_action(request, action_prefix)
                        
                        # Get details based on the request
                        details = self._extract_details(request)
                        
                        # Log type based on response code
                        log_type = self._determine_log_type(response.status_code)
                        
                        # Log the event
                        log_audit_event(
                            user=request.user,
                            action=action,
                            details=details,
                            log_type=log_type,
                            request=request
                        )
        
        return response
    
    def _extract_action(self, request, action_prefix):
        """Extract action from request method and URL"""
        method = request.method
        url_name = resolve(request.path).url_name or ""
        
        if method == 'POST':
            verb = 'Create'
        elif method == 'PUT' or method == 'PATCH':
            verb = 'Update'
        elif method == 'DELETE':
            verb = 'Delete'
        else:
            verb = method
        
        return f"{action_prefix}: {verb} {url_name}"
    
    def _extract_details(self, request):
        """Extract details from request"""
        details = {
            'method': request.method,
            'path': request.path,
        }
        
        # Add body data for non-GET requests, excluding sensitive fields
        if request.method != 'GET' and hasattr(request, 'data'):
            safe_data = request.data.copy()
            for field in ['password', 'token', 'key', 'secret']:
                if field in safe_data:
                    safe_data[field] = '[REDACTED]'
            details['data'] = safe_data
        
        return str(details)
    
    def _determine_log_type(self, status_code):
        """Determine log type based on response status code"""
        if status_code >= 400:
            return 'error'
        elif status_code >= 300:
            return 'warning'
        else:
            return 'success' 