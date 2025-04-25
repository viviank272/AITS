from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_all_notifications, name='all-notifications'),
    path('create/', views.create_notification, name='create-notification'),
    path('student/', views.get_student_notifications, name='student-notifications'),
    path('<int:notification_id>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('mark-all-read/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
] 