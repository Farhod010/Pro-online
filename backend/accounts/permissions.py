from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """Faqat Super Admin uchun"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'superadmin'


class IsManager(BasePermission):
    """Manager yoki undan yuqori"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('manager', 'superadmin')


class IsTeacher(BasePermission):
    """Ustoz yoki undan yuqori"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('teacher', 'manager', 'superadmin')


class IsStudent(BasePermission):
    """O'quvchi"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'


class IsOwnerOrAdmin(BasePermission):
    """Ob'yekt egasi yoki admin"""
    def has_object_permission(self, request, view, obj):
        if request.user.role in ('superadmin', 'manager'):
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'student'):
            return obj.student == request.user
        return obj == request.user
