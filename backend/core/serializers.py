from rest_framework import serializers
from .models import ActivityLog, PlatformSettings, Review, StudentQuestion, Certificate


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['id', 'who', 'role', 'action', 'target', 'log_type', 'created_at']


class PlatformSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSettings
        fields = ['platform_name', 'contact_email', 'telegram',
                  'registration_open', 'auto_unlock',
                  'email_notifications', 'telegram_notifications',
                  'maintenance_mode']


class ReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'student', 'student_name', 'course', 'course_title',
                  'rating', 'text', 'reply', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_student_name(self, obj):
        return obj.student.get_full_name()

    def get_course_title(self, obj):
        return obj.course.title


class StudentQuestionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentQuestion
        fields = ['id', 'student', 'student_name', 'course', 'course_title',
                  'teacher', 'teacher_name', 'lesson_ref', 'text', 'answer',
                  'status', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_student_name(self, obj):
        return obj.student.get_full_name()

    def get_course_title(self, obj):
        return obj.course.title

    def get_teacher_name(self, obj):
        return obj.teacher.get_full_name() if obj.teacher else '—'


class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = ['id', 'certificate_id', 'student', 'student_name',
                  'course', 'course_title', 'status', 'issued_at']
        read_only_fields = ['id', 'issued_at']

    def get_student_name(self, obj):
        return obj.student.get_full_name()

    def get_course_title(self, obj):
        return obj.course.title
