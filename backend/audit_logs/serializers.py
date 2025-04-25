from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'timestamp', 'user', 'username', 'action', 
            'details', 'ip_address', 'type'
        ]
        read_only_fields = ['id', 'timestamp']
    
    def get_username(self, obj):
        if obj.user:
            return obj.user.full_name  # Assuming full_name is a field on your User model
        return 'Unknown' 