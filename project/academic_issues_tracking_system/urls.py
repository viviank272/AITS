"""
URL configuration for academic_issues_tracking_system project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

# from django.contrib import admin
# from django.urls import path, include
# # from django.conf.urls import url
# from aits.views import *

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('aits/', ReactView.as_view(), name="home"),
# ]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from aits.views import RegisterView, LoginView, IssueViewSet, CommentViewSet, NotificationViewSet, DashboardStats,CreateIssueView,AssignIssueView,ResolveIssueView

router = DefaultRouter()
router.register(r'issues', IssueViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('dashboard-stats/', DashboardStats.as_view(), name='dashboard-stats'),
    path('create-issue/', CreateIssueView.as_view(), name='create-issue'),
    path('assign-issue/', AssignIssueView.as_view(), name='assign-issue'),
    path('resolve-issue/', ResolveIssueView.as_view(), name='resolve-issue'),
    path('', include(router.urls)),
]