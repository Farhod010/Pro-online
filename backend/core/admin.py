from django.contrib import admin
from .models import ActivityLog, PlatformSettings, Review, StudentQuestion, Certificate

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['who', 'role', 'action', 'target', 'log_type', 'created_at']
    list_filter = ['log_type', 'role']

@admin.register(PlatformSettings)
class PlatformSettingsAdmin(admin.ModelAdmin):
    list_display = ['platform_name', 'contact_email', 'maintenance_mode']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'rating', 'status', 'created_at']
    list_filter = ['rating', 'status']

@admin.register(StudentQuestion)
class StudentQuestionAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'status', 'created_at']
    list_filter = ['status']

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['certificate_id', 'student', 'course', 'status', 'issued_at']
    list_filter = ['status']
