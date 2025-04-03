from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Role, Student


class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'full_name', 'user_type', 'is_active', 'is_staff')
    list_filter = ('is_active', 'user_type', 'role')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('username', 'full_name')}),
        (_('Role information'), {'fields': ('user_type', 'role', 'department')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                      'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'created_at')}),
    )
    readonly_fields = ('created_at',)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'full_name', 'password1', 'password2', 'user_type', 'role', 'department'),
        }),
    )
    search_fields = ('email', 'username', 'full_name')
    ordering = ('email',)


class RoleAdmin(admin.ModelAdmin):
    list_display = ('role_name', 'description', 'created_at')
    search_fields = ('role_name', 'description')


class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_number', 'registration_number', 'get_full_name', 'program', 'department', 'year_level', 'semester_in_year', 'current_semester', 'enrollment_status')
    list_filter = ('program', 'department', 'year_level', 'semester_in_year', 'current_semester', 'enrollment_status')
    search_fields = ('student_number', 'registration_number', 'user__full_name', 'user__email')
    
    def get_full_name(self, obj):
        return obj.user.full_name
    get_full_name.short_description = 'Full Name'


admin.site.register(User, UserAdmin)
admin.site.register(Role, RoleAdmin)
admin.site.register(Student, StudentAdmin)
