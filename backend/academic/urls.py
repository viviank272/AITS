from django.urls import path
from . import views

urlpatterns = [
    path('colleges/', views.list_colleges, name='college-list'),
    path('colleges/<int:pk>/', views.college_detail, name='college-detail'),
    path('departments/', views.list_departments, name='department-list'),
    path('departments/<int:pk>/', views.department_detail, name='department-detail'),
    path('departments/college/<int:college_id>/', views.get_departments_by_college, name='departments-by-college'),
    path('programs/', views.program_list_create, name='program-list-create'),
    path('programs/<int:pk>/', views.program_detail, name='program-detail'),
    path('programs/department/<int:department_id>/', views.get_programs_by_department, name='programs-by-department'),
] 