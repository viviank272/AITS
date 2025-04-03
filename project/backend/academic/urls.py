from django.urls import path
from . import views

urlpatterns = [
    path('colleges/', views.list_colleges, name='college-list'),
    path('colleges/<int:pk>/', views.college_detail, name='college-detail'),
    path('departments/', views.list_departments, name='department-list'),
    path('departments/<int:pk>/', views.department_detail, name='department-detail'),
    path('programs/', views.list_programs, name='program-list'),
] 