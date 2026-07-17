from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import models

from .models import Category, Course, Module, Lesson
from .serializers import (
    CategorySerializer, CourseListSerializer, CourseDetailSerializer,
    CourseCreateSerializer, ModuleSerializer, LessonSerializer
)
from accounts.permissions import IsTeacher, IsManager, IsSuperAdmin


class CategoryViewSet(viewsets.ModelViewSet):
    """Kategoriyalarni boshqarish"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsSuperAdmin()]


class CourseViewSet(viewsets.ModelViewSet):
    """Kurslarni boshqarish"""
    queryset = Course.objects.select_related('teacher', 'category').all()

    def get_serializer_class(self):
        if self.action == 'create':
            return CourseCreateSerializer
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsTeacher()]

    def get_queryset(self):
        qs = super().get_queryset()
        # Public: faqat published kurslar
        if not self.request.user.is_authenticated or self.request.user.role == 'student':
            if self.action == 'list':
                qs = qs.filter(status='published')

        cat = self.request.query_params.get('category')
        level = self.request.query_params.get('level')
        search = self.request.query_params.get('search')
        featured = self.request.query_params.get('featured')
        teacher = self.request.query_params.get('teacher')
        status_param = self.request.query_params.get('status')

        if cat:
            qs = qs.filter(category__name__icontains=cat)
        if level:
            qs = qs.filter(level=level)
        if search:
            qs = qs.filter(
                models.Q(title__icontains=search) |
                models.Q(teacher__first_name__icontains=search) |
                models.Q(teacher__last_name__icontains=search)
            )
        if featured:
            qs = qs.filter(featured=True)
        if teacher:
            qs = qs.filter(teacher_id=teacher)
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsManager])
    def publish(self, request, pk=None):
        course = self.get_object()
        course.status = 'published'
        course.save(update_fields=['status'])
        return Response({'ok': True})

    @action(detail=True, methods=['post'], permission_classes=[IsManager])
    def unpublish(self, request, pk=None):
        course = self.get_object()
        course.status = 'draft'
        course.save(update_fields=['status'])
        return Response({'ok': True})

    @action(detail=True, methods=['post'], permission_classes=[IsManager])
    def toggle_featured(self, request, pk=None):
        course = self.get_object()
        course.featured = not course.featured
        course.save(update_fields=['featured'])
        return Response({'ok': True, 'featured': course.featured})

    @action(detail=True, methods=['get'])
    def modules(self, request, pk=None):
        course = self.get_object()
        modules = Module.objects.filter(course=course).prefetch_related('lessons')
        return Response(ModuleSerializer(modules, many=True).data)

    @action(detail=True, methods=['get'])
    def lessons(self, request, pk=None):
        course = self.get_object()
        lessons = Lesson.objects.filter(course=course)
        return Response(LessonSerializer(lessons, many=True).data)


class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.prefetch_related('lessons').all()
    serializer_class = ModuleSerializer
    permission_classes = [IsTeacher]


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.select_related('module', 'course').all()
    serializer_class = LessonSerializer
    permission_classes = [IsTeacher]
