from django.db import models


class ActivityLog(models.Model):
    """Tizim loglari"""
    LOG_TYPES = [
        ('auth', 'Autentifikatsiya'),
        ('content', 'Kontent'),
        ('payment', "To'lov"),
        ('enroll', 'Yozilish'),
        ('security', 'Xavfsizlik'),
        ('settings', 'Sozlamalar'),
        ('test', 'Test'),
    ]

    who = models.CharField(max_length=150)
    role = models.CharField(max_length=30)
    action = models.CharField(max_length=300)
    target = models.CharField(max_length=500, blank=True, default='')
    log_type = models.CharField(max_length=20, choices=LOG_TYPES, default='content')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.who} — {self.action}"


class PlatformSettings(models.Model):
    """Platforma sozlamalari (singleton)"""
    platform_name = models.CharField(max_length=200, default='ProSkill IT Academy')
    contact_email = models.EmailField(default='info@proskill.uz')
    telegram = models.CharField(max_length=100, default='@proskill_bot')
    registration_open = models.BooleanField(default=True)
    auto_unlock = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    telegram_notifications = models.BooleanField(default=True)
    maintenance_mode = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Platforma sozlamalari'
        verbose_name_plural = 'Platforma sozlamalari'

    def __str__(self):
        return self.platform_name

    def save(self, *args, **kwargs):
        # Singleton: faqat bitta ob'yekt bo'lsin
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Review(models.Model):
    """Kurs sharhi"""
    STATUS_CHOICES = [('visible', 'Ko\'rinadi'), ('hidden', 'Yashirin')]

    student = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='reviews')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(default=5)
    text = models.TextField()
    reply = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='visible')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.get_full_name()} → {self.course.title} ({self.rating}★)"


class StudentQuestion(models.Model):
    """O'quvchi savoli"""
    STATUS_CHOICES = [('unanswered', 'Javobsiz'), ('answered', 'Javoblangan')]

    student = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='student_questions')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='student_questions')
    teacher = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='received_questions')
    lesson_ref = models.CharField(max_length=100, blank=True, default='')
    text = models.TextField()
    answer = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unanswered')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.get_full_name()}: {self.text[:60]}"


class Certificate(models.Model):
    """Sertifikat"""
    STATUS_CHOICES = [('valid', 'Amal qiladi'), ('revoked', 'Bekor qilingan')]

    certificate_id = models.CharField(max_length=30, unique=True)
    student = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='certificates')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='valid')
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-issued_at']
        unique_together = ['student', 'course']

    def __str__(self):
        return f"{self.certificate_id} — {self.student.get_full_name()}"
