from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.EnrollmentViewSet, basename='enrollments')

urlpatterns = [
    path('progress/complete/', views.complete_lesson, name='complete-lesson'),
    path('progress/<int:course_id>/', views.course_progress, name='course-progress'),
] + router.urls
