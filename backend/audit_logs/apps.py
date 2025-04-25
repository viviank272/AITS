from django.apps import AppConfig


class AuditLogsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'audit_logs'
    verbose_name = 'Audit Logs'
    
    def ready(self):
        # Import signals to register them
        import audit_logs.signals
