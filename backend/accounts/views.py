import os
from django.conf import settings
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
@permission_classes([AllowAny])
def google_login_view(request):
    """
    Google Sign-In: frontend yuborgan ID token (credential) ni tekshiradi,
    foydalanuvchini yaratadi yoki topadi, JWT qaytaradi.
    Body: { "credential": "<google_id_token_jwt>" }
    """
    credential = (request.data.get('credential') or request.data.get('id_token') or '').strip()
    if not credential:
        return Response(
            {'ok': False, 'error': 'Google credential (id_token) yuborilmadi'},
            status=status.HTTP_400_BAD_REQUEST
        )

    client_id = getattr(settings, 'GOOGLE_CLIENT_ID', '') or os.environ.get('GOOGLE_CLIENT_ID', '')
    if not client_id or client_id.startswith('YOUR_'):
        return Response(
            {
                'ok': False,
                'error': 'GOOGLE_CLIENT_ID sozlanmagan. backend/.env fayliga Google Client ID yozing.',
                'code': 'GOOGLE_CLIENT_ID_MISSING'
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
    except ImportError:
        return Response(
            {
                'ok': False,
                'error': 'google-auth o\'rnatilmagan. Terminalda: pip install google-auth',
                'code': 'DEPENDENCY_MISSING'
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    try:
        # Google tokenni tekshirish — soxta token qabul qilinmaydi
        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            client_id,
            clock_skew_in_seconds=10,
        )
    except ValueError as e:
        return Response(
            {'ok': False, 'error': 'Google token yaroqsiz yoki muddati o\'tgan', 'detail': str(e)},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        return Response(
            {'ok': False, 'error': 'Google tekshiruvida xato', 'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Majburiy maydonlar
    email = (idinfo.get('email') or '').strip().lower()
    if not email:
        return Response({'ok': False, 'error': 'Google hisobida email yo\'q'}, status=status.HTTP_400_BAD_REQUEST)
    if not idinfo.get('email_verified', True):
        return Response({'ok': False, 'error': 'Google email tasdiqlanmagan'}, status=status.HTTP_400_BAD_REQUEST)

    google_sub = idinfo.get('sub') or ''
    given = (idinfo.get('given_name') or '').strip()
    family = (idinfo.get('family_name') or '').strip()
    full_name = (idinfo.get('name') or f'{given} {family}'.strip() or email.split('@')[0]).strip()
    picture = (idinfo.get('picture') or '').strip()

    # 1) google_id bo'yicha, 2) email bo'yicha qidirish
    user = None
    if google_sub:
        user = User.objects.filter(google_id=google_sub).first()
    if not user:
        user = User.objects.filter(email__iexact=email).first()

    created = False
    if not user:
        # Yangi o'quvchi (student) sifatida yaratamiz
        base_username = email.split('@')[0][:40] or f'guser{User.objects.count()}'
        username = base_username
        n = 1
        while User.objects.filter(username=username).exists():
            username = f'{base_username}{n}'
            n += 1
        parts = full_name.split(None, 1)
        user = User(
            username=username,
            email=email,
            first_name=parts[0] if parts else full_name,
            last_name=parts[1] if len(parts) > 1 else '',
            role='student',
            status='active',
            google_id=google_sub,
            avatar_url=picture,
            last_seen='Hozir',
            joined_label='Google',
        )
        # Google orqali kirganlarga random unusable password
        user.set_unusable_password()
        user.save()
        created = True
    else:
        if user.status == 'blocked':
            return Response({'ok': False, 'error': 'Hisobingiz bloklangan'}, status=status.HTTP_403_FORBIDDEN)
        # Mavjud userni Google ma'lumotlari bilan yangilash
        updated = []
        if google_sub and user.google_id != google_sub:
            user.google_id = google_sub
            updated.append('google_id')
        if picture and user.avatar_url != picture:
            user.avatar_url = picture
            updated.append('avatar_url')
        if not user.first_name and given:
            user.first_name = given
            updated.append('first_name')
        if not user.last_name and family:
            user.last_name = family
            updated.append('last_name')
        user.last_seen = 'Hozir'
        updated.append('last_seen')
        user.save(update_fields=list(set(updated)) or None)

    refresh = RefreshToken.for_user(user)
    return Response({
        'ok': True,
        'created': created,
        'user': {
            **UserSerializer(user).data,
            'name': user.get_full_name() or user.username,
            'avatar_url': user.avatar_url or '',
            'google_id': user.google_id or '',
        },
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        },
        # Frontend localStorage ProSkillDB uchun qulay format
        'profile': {
            'name': user.get_full_name() or user.username,
            'email': user.email,
            'avatar': user.avatar_url or '',
            'googleId': user.google_id or '',
            'role': user.role,
        }
    })


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
