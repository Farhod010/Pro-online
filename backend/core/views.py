from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Sum, Count, Q

from .models import ActivityLog, PlatformSettings, Review, StudentQuestion, Certificate
from .serializers import (
    ActivityLogSerializer, PlatformSettingsSerializer,
    ReviewSerializer, StudentQuestionSerializer, CertificateSerializer
)
from accounts.models import User
from accounts.permissions import IsSuperAdmin, IsManager, IsTeacher
from courses.models import Course
from enrollments.models import Enrollment, Progress
from payments.models import Payment


@api_view(['GET'])
@permission_classes([IsManager])
def analytics_view(request):
    """Umumiy statistika"""
    students = User.objects.filter(role='student').count()
    teachers = User.objects.filter(role='teacher').count()
    managers = User.objects.filter(role='manager').count()
    total_users = User.objects.count()

    total_courses = Course.objects.count()
    published = Course.objects.filter(status='published').count()
    draft = Course.objects.filter(status='draft').count()
    pending = Course.objects.filter(status='pending').count()

    total_enrollments = Enrollment.objects.count()
    total_payments = Payment.objects.count()
    paid_payments = Payment.objects.filter(status='paid').count()
    pending_payments = Payment.objects.filter(status='pending').count()
    failed_payments = Payment.objects.filter(status='failed').count()

    revenue = Payment.objects.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0
    formatted_revenue = '{:,}'.format(revenue).replace(',', ' ') + " so'm"

    certificates = Certificate.objects.count()

    return Response({
        'users': total_users,
        'students': students,
        'teachers': teachers,
        'managers': managers,
        'courses': total_courses,
        'published_courses': published,
        'draft_courses': draft,
        'pending_courses': pending,
        'enrollments': total_enrollments,
        'payments': total_payments,
        'paid_payments': paid_payments,
        'pending_payments': pending_payments,
        'failed_payments': failed_payments,
        'certificates': certificates,
        'revenue': revenue,
        'revenue_label': formatted_revenue,
    })


@api_view(['GET'])
@permission_classes([IsManager])
def top_courses_view(request):
    """Eng mashhur kurslar"""
    n = int(request.query_params.get('limit', 5))
    courses = Course.objects.annotate(
        enroll_count=Count('enrollments')
    ).order_by('-enroll_count')[:n]

    data = []
    for c in courses:
        data.append({
            'id': c.id,
            'title': c.title,
            'category': c.category.name if c.category else '—',
            'enrollments': c.enroll_count,
            'revenue': c.price * c.enroll_count,
        })
    return Response(data)


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()[:200]
    serializer_class = ActivityLogSerializer
    permission_classes = [IsManager]


@api_view(['GET', 'PUT'])
@permission_classes([IsSuperAdmin])
def settings_view(request):
    """Platforma sozlamalari"""
    settings_obj = PlatformSettings.load()
    if request.method == 'GET':
        return Response(PlatformSettingsSerializer(settings_obj).data)
    serializer = PlatformSettingsSerializer(settings_obj, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({'ok': True, 'settings': serializer.data})


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        qs = Review.objects.select_related('student', 'course').all()
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        if self.action == 'create':
            return [IsAuthenticated()]
        return [IsManager()]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsTeacher])
    def reply(self, request, pk=None):
        review = self.get_object()
        review.reply = request.data.get('reply', '')
        review.save(update_fields=['reply'])
        return Response({'ok': True})


class StudentQuestionViewSet(viewsets.ModelViewSet):
    serializer_class = StudentQuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = StudentQuestion.objects.select_related('student', 'course', 'teacher').all()
        if user.role == 'student':
            qs = qs.filter(student=user)
        elif user.role == 'teacher':
            qs = qs.filter(teacher=user)
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        serializer.save(
            student=self.request.user,
            teacher=course.teacher if course else None
        )

    @action(detail=True, methods=['post'], permission_classes=[IsTeacher])
    def answer(self, request, pk=None):
        question = self.get_object()
        question.answer = request.data.get('answer', '')
        question.status = 'answered'
        question.save(update_fields=['answer', 'status'])
        return Response({'ok': True})


class CertificateViewSet(viewsets.ModelViewSet):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Certificate.objects.select_related('student', 'course').all()
        if user.role == 'student':
            qs = qs.filter(student=user)
        return qs

    @action(detail=False, methods=['post'])
    def issue(self, request):
        """Sertifikat berish"""
        course_id = request.data.get('course_id')
        from courses.models import Lesson
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'ok': False, 'error': 'Kurs topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        total = Lesson.objects.filter(course=course).count()
        completed = Progress.objects.filter(student=request.user, lesson__course=course).count()
        if total == 0 or completed < total:
            return Response({'ok': False, 'error': 'Kurs hali 100% tugatilmagan'}, status=status.HTTP_400_BAD_REQUEST)

        existing = Certificate.objects.filter(student=request.user, course=course).first()
        if existing:
            return Response({'ok': True, 'cert': CertificateSerializer(existing).data})

        import datetime
        cert_id = f'PSK-{datetime.date.today().year}-{1000 + Certificate.objects.count():04d}'
        cert = Certificate.objects.create(
            certificate_id=cert_id,
            student=request.user,
            course=course,
        )
        return Response({'ok': True, 'cert': CertificateSerializer(cert).data})


def serve_file_from_parent(request, path=''):
    import os
    from django.conf import settings
    from django.http import FileResponse, Http404, HttpResponse

    if not path or path == '.' or path == '/':
        clean_path = "ProSkill IT Academy.dc.html"
    else:
        clean_path = os.path.normpath(path).replace('\\', '/').lstrip('/')
        if clean_path == '.' or not clean_path:
            clean_path = "ProSkill IT Academy.dc.html"

    if clean_path.startswith('..') or clean_path.startswith('/') or clean_path.startswith('\\'):
        raise Http404("Taqiqlangan yo'l")

    html_mapping = {
        "manager": "ProSkill Manager.dc.html",
        "student": "ProSkill Student.dc.html",
        "super-admin": "ProSkill Super Admin.dc.html",
        "teacher": "ProSkill Teacher.dc.html",
    }
    if clean_path in html_mapping:
        clean_path = html_mapping[clean_path]

    basename = os.path.basename(clean_path)
    if basename in ["support.js", "proskill-db.js", "image-slot.js", "logo.png"]:
        file_path = os.path.join(settings.BASE_DIR.parent, basename)
    else:
        file_path = os.path.join(settings.BASE_DIR.parent, clean_path)

    if os.path.exists(file_path) and os.path.isfile(file_path):
        if file_path.endswith('.html'):
            with open(file_path, 'r', encoding='utf-8') as f:
                return HttpResponse(f.read(), content_type='text/html')
        elif file_path.endswith('.js'):
            with open(file_path, 'r', encoding='utf-8') as f:
                return HttpResponse(f.read(), content_type='application/javascript')
        else:
            return FileResponse(open(file_path, 'rb'))

    parts = clean_path.split(os.sep)
    if len(parts) > 1:
        sub_path = os.sep.join(parts[1:])
        fallback_path = os.path.join(settings.BASE_DIR.parent, sub_path)
        if os.path.exists(fallback_path) and os.path.isfile(fallback_path):
            if fallback_path.endswith('.js'):
                with open(fallback_path, 'r', encoding='utf-8') as f:
                    return HttpResponse(f.read(), content_type='application/javascript')
            return FileResponse(open(fallback_path, 'rb'))

    raise Http404(f"Fayl topilmadi: {clean_path}")

