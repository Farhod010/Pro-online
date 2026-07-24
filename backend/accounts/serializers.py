from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    initial = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'status', 'phone', 'bio', 'specialization',
                  'avatar', 'avatar_url', 'google_id',
                  'joined_label', 'last_seen', 'initial', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'google_id']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'phone', 'role']

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.get('email', '')
        validated_data['username'] = email.split('@')[0] if email else f'user_{User.objects.count()}'
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError({'error': 'Foydalanuvchi topilmadi'})

        if not user.check_password(data['password']):
            raise serializers.ValidationError({'error': 'Parol noto\'g\'ri'})

        if user.status == 'blocked':
            raise serializers.ValidationError({'error': 'Hisobingiz bloklangan'})

        data['user'] = user
        return data


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=4)
    phone = serializers.CharField(max_length=20, required=False, default='')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu email allaqachon ro'yxatdan o'tgan")
        return value

    def create(self, validated_data):
        name_parts = validated_data['name'].split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        email = validated_data['email']
        user = User(
            username=email.split('@')[0],
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=validated_data.get('phone', ''),
            role='student',
            status='active',
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
