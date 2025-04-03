from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.user_login, name='login'),
    path('profile/', views.get_user_profile, name='profile'),
    path('students/', views.list_students, name='student-list'),
    path('students/<int:student_id>/', views.student_detail, name='student-detail'),
    path('logout/', views.user_logout, name='logout'),
] 