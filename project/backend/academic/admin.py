from django.contrib import admin
from .models import College, Department, Program


class CollegeAdmin(admin.ModelAdmin):
    list_display = ('college_name', 'campus_location', 'get_dean_name', 'created_at')
    search_fields = ('college_name', 'description', 'campus_location')
    
    def get_dean_name(self, obj):
        if obj.dean_user_id:
            return obj.dean_user_id.full_name
        return 'Not assigned'
    get_dean_name.short_description = 'Dean'


class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('dept_name', 'college', 'get_head_name', 'created_at')
    list_filter = ('college',)
    search_fields = ('dept_name', 'description')
    
    def get_head_name(self, obj):
        if obj.head_user_id:
            return obj.head_user_id.full_name
        return 'Not assigned'
    get_head_name.short_description = 'Department Head'


class ProgramAdmin(admin.ModelAdmin):
    list_display = ('program_name', 'degree_level', 'department', 'college', 'is_active')
    list_filter = ('degree_level', 'college', 'department', 'is_active')
    search_fields = ('program_name',)


admin.site.register(College, CollegeAdmin)
admin.site.register(Department, DepartmentAdmin)
admin.site.register(Program, ProgramAdmin)
