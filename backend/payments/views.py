from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Payment
from .serializers import PaymentSerializer
from courses.models import Course
from enrollments.models import Enrollment
from accounts.permissions import IsManager


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Payment.objects.select_related('student', 'course')
        if user.role in ('superadmin', 'manager'):
            pass  # ko'radi hammani
        else:
            qs = qs.filter(student=user)

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    @action(detail=False, methods=['post'])
    def request_payment(self, request):
        """To'lov so'rovi yuborish"""
        course_id = request.data.get('course_id')
        method = request.data.get('method', 'payme')

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'ok': False, 'error': 'Kurs topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response({'ok': False, 'error': 'Allaqachon yozilgansiz'}, status=status.HTTP_400_BAD_REQUEST)

        count = Payment.objects.count()
        order_number = f'#{10300 + count}'

        payment = Payment.objects.create(
            order_number=order_number,
            student=request.user,
            course=course,
            amount=course.price,
            method=method,
            status='pending',
        )
        return Response({'ok': True, 'payment': PaymentSerializer(payment).data})

    @action(detail=True, methods=['post'], permission_classes=[IsManager])
    def approve(self, request, pk=None):
        """To'lovni tasdiqlash"""
        payment = self.get_object()
        payment.status = 'paid'
        payment.save(update_fields=['status'])

        # Kursga avtomatik yozish
        Enrollment.objects.get_or_create(
            student=payment.student,
            course=payment.course,
            defaults={'type': 'paid', 'status': 'active'}
        )
        return Response({'ok': True})

    @action(detail=True, methods=['post'], permission_classes=[IsManager])
    def reject(self, request, pk=None):
        """To'lovni rad qilish"""
        payment = self.get_object()
        payment.status = 'failed'
        payment.reason = request.data.get('reason', "To'lov rad etildi")
        payment.save(update_fields=['status', 'reason'])
        return Response({'ok': True})
