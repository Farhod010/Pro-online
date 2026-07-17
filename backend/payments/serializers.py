from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()
    amount_label = serializers.ReadOnlyField()

    class Meta:
        model = Payment
        fields = ['id', 'order_number', 'student', 'student_name',
                  'course', 'course_title', 'amount', 'amount_label',
                  'method', 'status', 'reason', 'created_at', 'updated_at']
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']

    def get_student_name(self, obj):
        return obj.student.get_full_name()

    def get_course_title(self, obj):
        return obj.course.title
