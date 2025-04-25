from rest_framework import serializers
from .models import FileUpload
from users.serializers import UserSerializer

class FileUploadSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)

    class Meta:
        model = FileUpload
        fields = ['id', 'file', 'file_name', 'file_type', 'file_size', 'uploaded_by', 'uploaded_at']
        read_only_fields = ['uploaded_at', 'file_type', 'file_size'] 