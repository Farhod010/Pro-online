from rest_framework import serializers
from .models import Test, Question, TestResult


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'options', 'correct', 'order']


class QuestionPublicSerializer(serializers.ModelSerializer):
    """Correct javobni ko'rsatmaydi"""
    class Meta:
        model = Question
        fields = ['id', 'text', 'options', 'order']


class TestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = ['id', 'course', 'module_ref', 'title', 'pass_percent',
                  'active', 'questions', 'questions_count', 'created_at']

    def get_questions_count(self, obj):
        return obj.questions.count()


class TestPublicSerializer(serializers.ModelSerializer):
    """Talabalar uchun — correct javob ko'rinmaydi"""
    questions = QuestionPublicSerializer(many=True, read_only=True)
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = ['id', 'course', 'module_ref', 'title', 'pass_percent',
                  'active', 'questions', 'questions_count']

    def get_questions_count(self, obj):
        return obj.questions.count()


class TestResultSerializer(serializers.ModelSerializer):
    test_title = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = TestResult
        fields = ['id', 'student', 'student_name', 'test', 'test_title',
                  'score', 'correct_count', 'wrong_count', 'percentage',
                  'passed', 'submitted_at']

    def get_test_title(self, obj):
        return obj.test.title

    def get_student_name(self, obj):
        return obj.student.get_full_name()
