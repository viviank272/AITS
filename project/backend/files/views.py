from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import FileUpload
from .serializers import FileUploadSerializer
import os

# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

    file_obj = request.FILES['file']
    file_name = file_obj.name
    file_type = file_obj.content_type
    file_size = file_obj.size

    # Create file upload object
    file_upload = FileUpload.objects.create(
        file=file_obj,
        file_name=file_name,
        file_type=file_type,
        file_size=file_size,
        uploaded_by=request.user
    )

    serializer = FileUploadSerializer(file_upload)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_file(request, file_id):
    try:
        file_upload = FileUpload.objects.get(id=file_id)
        # Check if user has permission to delete the file
        if file_upload.uploaded_by != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Delete the file from storage
        if file_upload.file:
            if os.path.isfile(file_upload.file.path):
                os.remove(file_upload.file.path)
        
        # Delete the database record
        file_upload.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except FileUpload.DoesNotExist:
        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
