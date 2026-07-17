from rest_framework import serializers
from .models import Enrollment, Progress


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_name', 'course', 'course_title',
                  'type', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_student_name(self, obj):
        return obj.student.get_full_name()

    def get_course_title(self, obj):
        return obj.course.title


class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progress
        fields = ['id', 'student', 'lesson', 'completed_at']
        read_only_fields = ['id', 'completed_at']


class CourseProgressSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    course_title = serializers.CharField()
    total_lessons = serializers.IntegerField()
    completed_lessons = serializers.IntegerField()
    percentage = serializers.IntegerField()
