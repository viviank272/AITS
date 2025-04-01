from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.user_login, name='login'),
    path('profile/', views.get_user_profile, name='profile'),
    path('students/', views.list_students, name='student-list'),
] 