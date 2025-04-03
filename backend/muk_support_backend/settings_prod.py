"""
Production settings for muk_support_backend project on PythonAnywhere.
"""

from .settings import *

# Security settings
DEBUG = False
SECRET_KEY = 'a_more_secure_key_for_production'  # Replace with a secure key in the actual deployment

# PythonAnywhere host
ALLOWED_HOSTS = ['amnamara.pythonanywhere.com']

# Database
# Use MySQL database on PythonAnywhere
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'amnamara$muk_support_portal',
        'USER': 'amnamara',
        'PASSWORD': 'Root@123',  # Use environment variable in production
        'HOST': 'amnamara.mysql.pythonanywhere-services.com',
        'PORT': '',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'",
            'charset': 'utf8mb4',
        }
    }
}

# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = '/home/amnamara/muk-tracker/static'

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = '/home/amnamara/muk-tracker/media'

# Add custom CORS middleware
MIDDLEWARE = ['muk_support_backend.middleware.CorsMiddleware'] + MIDDLEWARE

# CORS settings for frontend
CORS_ALLOWED_ORIGINS = [
    "https://amnamara.pythonanywhere.com",
    "https://mak-issue-tracker.vercel.app",
]

# Allow credentials
CORS_ALLOW_CREDENTIALS = True

# Security settings - comment out during debugging
# CSRF_COOKIE_SECURE = True
# SESSION_COOKIE_SECURE = True
# SECURE_SSL_REDIRECT = True
# SECURE_HSTS_SECONDS = 31536000  # 1 year
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True 