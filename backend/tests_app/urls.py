from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.TestViewSet, basename='tests')

urlpatterns = [
    path('my-results/', views.my_results, name='my-results'),
] + router.urls
