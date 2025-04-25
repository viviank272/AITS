from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('verify/', views.verify_email, name='verify'),
    path('login/', views.user_login, name='login'),
    path('profile/', views.get_user_profile, name='profile'),
    path('students/', views.list_students, name='student-list'),
    path('students/<int:student_id>/', views.student_detail, name='student-detail'),
    path('logout/', views.user_logout, name='logout'),
    path('check-student/', views.check_student, name='check-student'),
    path('set-password/', views.set_student_password, name='set-password'),
    path('lecturers-and-admins/', views.list_lecturers_and_admins, name='list-lecturers-and-admins'),
    path('all/', views.list_all_users, name='list-all-users'),
    # Role management routes
    path('roles/', views.list_roles, name='role-list'),
    path('roles/create/', views.create_role, name='role-create'),
    path('roles/<int:role_id>/', views.role_detail, name='role-detail'),
] 