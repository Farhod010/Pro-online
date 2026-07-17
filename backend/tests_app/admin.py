from django.contrib import admin
from .models import Test, Question, TestResult

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1

@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'module_ref', 'pass_percent', 'active']
    inlines = [QuestionInline]

@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ['student', 'test', 'percentage', 'passed', 'submitted_at']
    list_filter = ['passed']
