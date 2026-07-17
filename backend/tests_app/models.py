from django.db import models
from django.conf import settings


class Test(models.Model):
    """Kurs testi"""
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='tests')
    module_ref = models.CharField(max_length=100, blank=True, default='')
    title = models.CharField(max_length=300)
    pass_percent = models.IntegerField(default=60)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['course', 'created_at']

    def __str__(self):
        return self.title


class Question(models.Model):
    """Test savoli"""
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    options = models.JSONField(default=list)  # ["variant1", "variant2", ...]
    correct = models.IntegerField(default=0)  # to'g'ri javob indeksi
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.text[:80]


class TestResult(models.Model):
    """Test natijasi"""
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='test_results')
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='results')
    score = models.IntegerField(default=0)
    correct_count = models.IntegerField(default=0)
    wrong_count = models.IntegerField(default=0)
    percentage = models.IntegerField(default=0)
    passed = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student.get_full_name()} — {self.test.title} ({self.percentage}%)"
