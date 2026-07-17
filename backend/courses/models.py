from django.db import models
from django.conf import settings


class Category(models.Model):
    """Kurs yo'nalishi"""
    name = models.CharField(max_length=100)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Course(models.Model):
    """Kurs"""
    LEVEL_CHOICES = [
        ('boshlangich', "Boshlang'ich"),
        ('orta', "O'rta"),
        ('professional', 'Professional'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Qoralama'),
        ('pending', 'Tekshiruvda'),
        ('published', 'Nashr qilingan'),
    ]

    title = models.CharField(max_length=300)
    description = models.TextField(blank=True, default='')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='courses')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='taught_courses')
    price = models.IntegerField(default=0)
    rating = models.FloatField(default=0)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='boshlangich')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    featured = models.BooleanField(default=False)
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def lessons_count(self):
        return Lesson.objects.filter(module__course=self).count()

    @property
    def modules_count(self):
        return self.modules.count()

    @property
    def students_count(self):
        return self.enrollments.filter(status='active').count()

    @property
    def price_label(self):
        if self.price == 0:
            return 'Bepul'
        formatted = '{:,}'.format(self.price).replace(',', ' ')
        return f"{formatted} so'm"

    @property
    def initial(self):
        return self.title[0].upper() if self.title else '?'


class Module(models.Model):
    """Kurs moduli"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=300)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} — {self.title}"


class Lesson(models.Model):
    """Dars"""
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=300)
    duration = models.CharField(max_length=20, blank=True, default='0:00')
    is_free = models.BooleanField(default=False)
    video_url = models.URLField(blank=True, default='')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['module__order', 'order']

    def __str__(self):
        return self.title
