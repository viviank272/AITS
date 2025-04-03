from django.contrib import admin
from .models import (
    Category, Priority, Status, Issue, Comment, 
    Attachment, IssueHistory, Notification
)


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'college')
    list_filter = ('is_active', 'college')
    search_fields = ('name', 'description')


class PriorityAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'sla_hours')
    list_filter = ('level',)
    search_fields = ('name',)
    ordering = ['level']


class StatusAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_terminal', 'description')
    list_filter = ('is_terminal',)
    search_fields = ('name', 'description')


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = ('created_at',)


class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 0
    readonly_fields = ('uploaded_at',)


class IssueHistoryInline(admin.TabularInline):
    model = IssueHistory
    extra = 0
    readonly_fields = ('user', 'field_name', 'old_value', 'new_value', 'changed_at')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


class IssueAdmin(admin.ModelAdmin):
    list_display = ('title', 'reporter', 'assignee', 'category', 'priority', 'status', 'created_at', 'is_student_issue')
    list_filter = ('status', 'priority', 'is_student_issue', 'category', 'college')
    search_fields = ('title', 'description', 'reporter__full_name', 'assignee__full_name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    inlines = [CommentInline, AttachmentInline, IssueHistoryInline]


class CommentAdmin(admin.ModelAdmin):
    list_display = ('issue', 'user', 'created_at', 'is_internal')
    list_filter = ('is_internal', 'created_at')
    search_fields = ('content', 'user__full_name', 'issue__title')
    readonly_fields = ('created_at',)


class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'issue', 'user', 'file_type', 'file_size', 'uploaded_at')
    list_filter = ('file_type', 'uploaded_at')
    search_fields = ('file_name', 'user__full_name', 'issue__title')
    readonly_fields = ('uploaded_at',)


class IssueHistoryAdmin(admin.ModelAdmin):
    list_display = ('issue', 'user', 'field_name', 'changed_at')
    list_filter = ('field_name', 'changed_at')
    search_fields = ('issue__title', 'user__full_name', 'field_name')
    readonly_fields = ('changed_at',)


class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'issue', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('message', 'user__full_name', 'issue__title')
    readonly_fields = ('created_at',)


admin.site.register(Category, CategoryAdmin)
admin.site.register(Priority, PriorityAdmin)
admin.site.register(Status, StatusAdmin)
admin.site.register(Issue, IssueAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(Attachment, AttachmentAdmin)
admin.site.register(IssueHistory, IssueHistoryAdmin)
admin.site.register(Notification, NotificationAdmin)
