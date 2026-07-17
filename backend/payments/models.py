from django.db import models
from django.conf import settings


class Payment(models.Model):
    """To'lov"""
    METHOD_CHOICES = [
        ('payme', 'Payme'),
        ('click', 'Click'),
        ('uzcard', 'Uzcard'),
        ('humo', 'Humo'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Kutilmoqda'),
        ('paid', "To'langan"),
        ('failed', 'Rad etilgan'),
    ]

    order_number = models.CharField(max_length=20, unique=True)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='payments')
    amount = models.IntegerField(default=0)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='payme')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reason = models.CharField(max_length=300, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number} — {self.student.get_full_name()} — {self.get_status_display()}"

    @property
    def amount_label(self):
        formatted = '{:,}'.format(self.amount).replace(',', ' ')
        return f"{formatted} so'm"
