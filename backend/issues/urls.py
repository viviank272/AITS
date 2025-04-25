from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_issues, name='issue-list'),
    path('student/', views.list_student_issues, name='student-issue-list'),
    path('lecturer/', views.list_lecturer_issues, name='lecturer-issue-list'),
    path('create/', views.create_issue, name='issue-create'),
    path('category-distribution/', views.get_category_distribution, name='category-distribution'),
    path('stats/', views.get_stats, name='issue-stats'),
    path('<int:pk>/', views.get_issue_detail, name='issue-detail'),
    path('<int:pk>/update/', views.update_issue, name='issue-update'),
    path('<int:pk>/delete/', views.delete_issue, name='issue-delete'),
    path('categories/', views.list_categories, name='category-list'),
    path('categories/create/', views.create_category, name='category-create'),
    path('categories/<int:pk>/update/', views.update_category, name='category-update'),
    path('categories/<int:pk>/delete/', views.delete_category, name='category-delete'),
    path('priorities/', views.list_priorities, name='priority-list'),
    path('statuses/', views.list_statuses, name='status-list'),
    path('upload/', views.upload_attachment, name='attachment-upload'),
    path('<int:pk>/comments/', views.issue_comments, name='issue_comments'),
    path('notifications/student/', views.get_student_notifications, name='student-notifications'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('notifications/mark-all-read/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
] 