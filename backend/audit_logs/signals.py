from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import user_logged_in, user_logged_out, user_login_failed
from django.contrib.auth.signals import user_logged_in, user_logged_out
import logging
from .utils import log_audit_event

logger = logging.getLogger(__name__)

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """Log user login events"""
    try:
        log_audit_event(
            user=user,
            action='User Login',
            details='User logged in successfully',
            log_type='success',
            request=request
        )
    except Exception as e:
        logger.error(f"Error logging user login: {str(e)}", exc_info=True)

@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    """Log user logout events"""
    try:
        log_audit_event(
            user=user,
            action='User Logout',
            details='User logged out',
            log_type='info',
            request=request
        )
    except Exception as e:
        logger.error(f"Error logging user logout: {str(e)}", exc_info=True)

@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    """Log failed login attempts"""
    try:
        username = credentials.get('username', 'unknown')
        log_audit_event(
            user=None,
            action='Failed Login',
            details=f'Failed login attempt for username: {username}',
            log_type='error',
            request=request
        )
    except Exception as e:
        logger.error(f"Error logging login failure: {str(e)}", exc_info=True) 