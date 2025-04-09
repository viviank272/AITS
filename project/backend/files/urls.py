from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_file, name='file-upload'),
    path('<int:file_id>/', views.delete_file, name='file-delete'),
] 