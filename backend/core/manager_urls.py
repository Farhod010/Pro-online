from django.urls import path
from . import manager_views

app_name = 'manager'

urlpatterns = [
    path('', manager_views.dashboard_view, name='dashboard'),
    path('students/', manager_views.students_view, name='students'),
    path('teachers/', manager_views.teachers_view, name='teachers'),
    path('courses/', manager_views.courses_view, name='courses'),
    path('assignments/', manager_views.assignments_view, name='assignments'),
    path('reports/', manager_views.reports_view, name='reports'),
    path('support/', manager_views.support_view, name='support'),
    path('profile/', manager_views.profile_view, name='profile'),
]
