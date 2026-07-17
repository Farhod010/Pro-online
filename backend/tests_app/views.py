from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Test, Question, TestResult
from .serializers import (
    TestSerializer, TestPublicSerializer,
    TestResultSerializer, QuestionSerializer
)
from accounts.permissions import IsTeacher


class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.prefetch_related('questions').all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user.role in ('teacher', 'manager', 'superadmin'):
            return TestSerializer
        return TestPublicSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'submit'):
            return [IsAuthenticated()]
        return [IsTeacher()]

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Test javoblarini yuborish"""
        test = self.get_object()
        answers = request.data.get('answers', [])  # [0, 2, 1, ...]

        questions = test.questions.order_by('order')
        total = questions.count()
        correct = 0

        for i, q in enumerate(questions):
            if i < len(answers) and answers[i] == q.correct:
                correct += 1

        pct = round(correct / total * 100) if total > 0 else 0
        passed = pct >= test.pass_percent

        result, created = TestResult.objects.update_or_create(
            student=request.user,
            test=test,
            defaults={
                'score': pct,
                'correct_count': correct,
                'wrong_count': total - correct,
                'percentage': pct,
                'passed': passed,
            }
        )
        return Response({
            'ok': True,
            'result': TestResultSerializer(result).data
        })

    @action(detail=True, methods=['get'])
    def result(self, request, pk=None):
        """Mening natijam"""
        test = self.get_object()
        try:
            result = TestResult.objects.get(student=request.user, test=test)
            return Response(TestResultSerializer(result).data)
        except TestResult.DoesNotExist:
            return Response({'detail': 'Natija topilmadi'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_results(request):
    """Barcha test natijalarim"""
    results = TestResult.objects.filter(student=request.user).select_related('test')
    return Response(TestResultSerializer(results, many=True).data)
