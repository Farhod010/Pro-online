from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """ProSkill foydalanuvchi modeli"""
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),
        ('manager', 'Manager'),
        ('teacher', 'Ustoz'),
        ('student', "O'quvchi"),
    ]
    STATUS_CHOICES = [
        ('active', 'Faol'),
        ('pending', 'Kutilmoqda'),
        ('blocked', 'Bloklangan'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    phone = models.CharField(max_length=20, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    specialization = models.CharField(max_length=200, blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    joined_label = models.CharField(max_length=50, blank=True, default='')
    last_seen = models.CharField(max_length=50, blank=True, default='Hozir')

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    @property
    def initial(self):
        name = self.get_full_name() or self.username
        parts = name.split()
        if len(parts) >= 2:
            return parts[0][0].upper() + parts[1][0].upper()
        return name[0].upper() if name else '?'
