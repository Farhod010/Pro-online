from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, CourseViewSet, ModuleViewSet, LessonViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='categories')
router.register('modules', ModuleViewSet, basename='modules')
router.register('lessons', LessonViewSet, basename='lessons')
router.register('', CourseViewSet, basename='courses')

urlpatterns = router.urls
