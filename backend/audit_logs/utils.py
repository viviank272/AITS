import logging
from .models import AuditLog

logger = logging.getLogger(__name__)

def log_audit_event(user, action, details=None, ip_address=None, log_type='info', request=None):
    """
    Utility function to log audit events.
    
    Args:
        user: The user who performed the action
        action: The action performed
        details: Additional details about the action
        ip_address: The IP address of the user
        log_type: The type of log entry ('info', 'success', 'warning', 'error')
        request: The request object, used to extract IP if not provided
    """
    try:
        # If IP address not provided but request is, extract IP from request
        if ip_address is None and request is not None:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0].strip()
            else:
                ip_address = request.META.get('REMOTE_ADDR')
        
        # Create the audit log entry
        AuditLog.objects.create(
            user=user,
            action=action,
            details=details,
            ip_address=ip_address,
            type=log_type
        )
        
        logger.info(f"Audit log created: {action} by {user}")
    except Exception as e:
        logger.error(f"Failed to create audit log: {str(e)}", exc_info=True) 