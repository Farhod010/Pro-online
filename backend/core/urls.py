from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('logs', views.ActivityLogViewSet, basename='logs')
router.register('reviews', views.ReviewViewSet, basename='reviews')
router.register('questions', views.StudentQuestionViewSet, basename='questions')
router.register('certificates', views.CertificateViewSet, basename='certificates')

urlpatterns = [
    path('analytics/', views.analytics_view, name='analytics'),
    path('analytics/top-courses/', views.top_courses_view, name='top-courses'),
    path('settings/', views.settings_view, name='platform-settings'),
] + router.urls
