from django.db import models
from django.conf import settings


class Enrollment(models.Model):
    """Kursga yozilish"""
    TYPE_CHOICES = [('free', 'Bepul'), ('paid', 'Pullik')]
    STATUS_CHOICES = [('active', 'Faol'), ('expired', 'Muddati tugagan'), ('cancelled', 'Bekor qilingan')]

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='enrollments')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='paid')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'course']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.get_full_name()} → {self.course.title}"


class Progress(models.Model):
    """Dars tugatish progressi"""
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    lesson = models.ForeignKey('courses.Lesson', on_delete=models.CASCADE, related_name='completions')
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'lesson']

    def __str__(self):
        return f"{self.student.get_full_name()} ✓ {self.lesson.title}"
