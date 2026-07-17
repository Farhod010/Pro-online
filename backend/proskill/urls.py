from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from core.views import serve_file_from_parent

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/users/', include('accounts.urls_users')),
    path('api/courses/', include('courses.urls')),
    path('api/enrollments/', include('enrollments.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/tests/', include('tests_app.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/', include('core.urls')),
    path('manager/', include('core.manager_urls')),
    re_path(r'^(?P<path>.*)$', serve_file_from_parent, name='serve-frontend'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

