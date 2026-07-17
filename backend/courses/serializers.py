from rest_framework import serializers
from .models import Category, Course, Module, Lesson


class CategorySerializer(serializers.ModelSerializer):
    course_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'active', 'course_count']

    def get_course_count(self, obj):
        return obj.courses.filter(status='published').count()


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'module', 'course', 'title', 'duration', 'is_free', 'video_url', 'order']


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'order', 'lessons']


class CourseListSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    teacher_initial = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    lessons_count = serializers.ReadOnlyField()
    students_count = serializers.ReadOnlyField()
    price_label = serializers.ReadOnlyField()
    initial = serializers.ReadOnlyField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'category_name',
                  'teacher', 'teacher_name', 'teacher_initial',
                  'price', 'price_label', 'rating', 'level', 'status',
                  'featured', 'thumbnail', 'lessons_count', 'students_count',
                  'initial', 'created_at']

    def get_teacher_name(self, obj):
        return obj.teacher.get_full_name() if obj.teacher else '—'

    def get_teacher_initial(self, obj):
        return obj.teacher.initial if obj.teacher else '?'

    def get_category_name(self, obj):
        return obj.category.name if obj.category else '—'


class CourseDetailSerializer(CourseListSerializer):
    modules = ModuleSerializer(many=True, read_only=True)

    class Meta(CourseListSerializer.Meta):
        fields = CourseListSerializer.Meta.fields + ['modules', 'updated_at']


class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['title', 'description', 'category', 'price', 'level', 'status', 'featured']
