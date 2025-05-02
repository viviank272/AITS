from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_issues, name='issue-list'),
    path('student/', views.list_student_issues, name='student-issue-list'),
    path('lecturer/', views.list_lecturer_issues, name='lecturer-issue-list'),
    path('create/', views.create_issue, name='issue-create'),
    path('<int:pk>/', views.get_issue_detail, name='issue-detail'),
    path('<int:pk>/update/', views.update_issue, name='issue-update'),
    path('<int:pk>/delete/', views.delete_issue, name='issue-delete'),
    path('categories/', views.list_categories, name='category-list'),
    path('priorities/', views.list_priorities, name='priority-list'),
    path('statuses/', views.list_statuses, name='status-list'),
    path('upload/', views.upload_attachment, name='attachment-upload'),
] 