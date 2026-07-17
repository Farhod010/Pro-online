from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    UserSerializer, UserCreateSerializer,
    LoginSerializer, RegisterSerializer
)
from .permissions import IsSuperAdmin, IsManager


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Tizimga kirish"""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    user.last_seen = 'Hozir'
    user.save(update_fields=['last_seen'])

    refresh = RefreshToken.for_user(user)
    return Response({
        'ok': True,
        'user': UserSerializer(user).data,
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Ro'yxatdan o'tish"""
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        'ok': True,
        'user': UserSerializer(user).data,
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_as_view(request):
    """Demo rol bilan tez kirish"""
    role = request.data.get('role', 'student')
    user = User.objects.filter(role=role, status='active').first()
    if not user:
        return Response({'ok': False, 'error': 'Bunday rolda faol foydalanuvchi topilmadi'},
                        status=status.HTTP_404_NOT_FOUND)
    user.last_seen = 'Hozir'
    user.save(update_fields=['last_seen'])

    refresh = RefreshToken.for_user(user)
    return Response({
        'ok': True,
        'user': UserSerializer(user).data,
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """Joriy foydalanuvchi ma'lumotlari"""
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Tizimdan chiqish"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass
    return Response({'ok': True})


class UserViewSet(viewsets.ModelViewSet):
    """Foydalanuvchilarni boshqarish (Admin)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsSuperAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        status_param = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        if role:
            qs = qs.filter(role=role)
        if status_param:
            qs = qs.filter(status=status_param)
        if search:
            from django.db import models
            qs = qs.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(email__icontains=search)
            )
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    @action(detail=True, methods=['post'])
    def block(self, request, pk=None):
        """Foydalanuvchini bloklash"""
        user = self.get_object()
        if user.role == 'superadmin':
            return Response({'ok': False, 'error': "Super Admin'ga tegib bo'lmaydi"},
                            status=status.HTTP_403_FORBIDDEN)
        user.status = 'blocked'
        user.save(update_fields=['status'])
        return Response({'ok': True})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Foydalanuvchini faollashtirish"""
        user = self.get_object()
        user.status = 'active'
        user.save(update_fields=['status'])
        return Response({'ok': True})

    @action(detail=True, methods=['post'])
    def change_role(self, request, pk=None):
        """Rolni o'zgartirish"""
        user = self.get_object()
        if user.role == 'superadmin':
            return Response({'ok': False, 'error': "Super Admin rolini o'zgartirib bo'lmaydi"},
                            status=status.HTTP_403_FORBIDDEN)
        new_role = request.data.get('role')
        if new_role not in dict(User.ROLE_CHOICES):
            return Response({'ok': False, 'error': 'Noto\'g\'ri rol'},
                            status=status.HTTP_400_BAD_REQUEST)
        user.role = new_role
        user.save(update_fields=['role'])
        return Response({'ok': True})
