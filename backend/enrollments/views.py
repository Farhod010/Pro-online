from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Enrollment, Progress
from .serializers import EnrollmentSerializer, ProgressSerializer, CourseProgressSerializer
from courses.models import Course, Lesson
from accounts.permissions import IsManager


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('superadmin', 'manager'):
            return Enrollment.objects.select_related('student', 'course').all()
        return Enrollment.objects.filter(student=user).select_related('course')

    @action(detail=False, methods=['get'])
    def my(self, request):
        """Mening kurslarim"""
        enrollments = Enrollment.objects.filter(
            student=request.user, status='active'
        ).select_related('course', 'course__teacher', 'course__category')
        return Response(EnrollmentSerializer(enrollments, many=True).data)

    @action(detail=False, methods=['post'])
    def enroll_free(self, request):
        """Bepul kursga yozilish"""
        course_id = request.data.get('course_id')
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'ok': False, 'error': 'Kurs topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        if course.price > 0:
            return Response({'ok': False, 'error': 'Bu kurs pullik'}, status=status.HTTP_400_BAD_REQUEST)

        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response({'ok': False, 'error': 'Allaqachon yozilgansiz'}, status=status.HTTP_400_BAD_REQUEST)

        Enrollment.objects.create(student=request.user, course=course, type='free', status='active')
        return Response({'ok': True})

    @action(detail=False, methods=['post'], permission_classes=[IsManager])
    def manual_enroll(self, request):
        """Qo'lda yozish (manager)"""
        from accounts.models import User
        student_id = request.data.get('student_id')
        course_id = request.data.get('course_id')
        try:
            student = User.objects.get(id=student_id)
            course = Course.objects.get(id=course_id)
        except (User.DoesNotExist, Course.DoesNotExist):
            return Response({'ok': False, 'error': 'Student yoki kurs topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        if Enrollment.objects.filter(student=student, course=course).exists():
            return Response({'ok': False, 'error': 'Allaqachon yozilgan'}, status=status.HTTP_400_BAD_REQUEST)

        Enrollment.objects.create(student=student, course=course, type='paid', status='active')
        return Response({'ok': True})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_lesson(request):
    """Darsni tugatdi deb belgilash"""
    lesson_id = request.data.get('lesson_id')
    try:
        lesson = Lesson.objects.get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({'ok': False, 'error': 'Dars topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    Progress.objects.get_or_create(student=request.user, lesson=lesson)
    return Response({'ok': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_progress(request, course_id):
    """Kurs bo'yicha progress"""
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'ok': False, 'error': 'Kurs topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    total = Lesson.objects.filter(course=course).count()
    completed = Progress.objects.filter(
        student=request.user,
        lesson__course=course
    ).count()
    pct = round(completed / total * 100) if total > 0 else 0

    return Response({
        'course_id': course.id,
        'course_title': course.title,
        'total_lessons': total,
        'completed_lessons': completed,
        'percentage': pct,
    })
