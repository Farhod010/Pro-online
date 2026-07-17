import csv
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.hashers import make_password
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import HttpResponse, Http404
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta

# Import models from apps
from accounts.models import User
from courses.models import Course, Category, Module, Lesson
from enrollments.models import Enrollment, Progress
from payments.models import Payment
from tests_app.models import Test, TestResult
from core.models import ActivityLog, PlatformSettings, Review, StudentQuestion, Certificate

# Custom decorator to check if user is a manager or superadmin
def manager_required(view_func):
    def wrap(request, *args, **kwargs):
        # Auto-login first manager if none is authenticated (for development/testing convenience)
        if not request.user.is_authenticated:
            first_manager = User.objects.filter(role__in=['manager', 'superadmin']).first()
            if first_manager:
                from django.contrib.auth import login
                login(request, first_manager)
            else:
                messages.error(request, "Iltimos, manager yoki admin hisobi bilan kiring.")
                return redirect('/admin/login/?next=' + request.path)
        
        if request.user.role in ['manager', 'superadmin']:
            return view_func(request, *args, **kwargs)
        
        messages.error(request, "Sizda bu sahifaga kirish huquqi yo'q.")
        return redirect('/admin/login/?next=' + request.path)
    return wrap

@manager_required
def dashboard_view(request):
    # Today's Statistics
    students_count = User.objects.filter(role='student').count()
    teachers_count = User.objects.filter(role='teacher').count()
    courses_count = Course.objects.count()
    pending_payments = Payment.objects.filter(status='pending').count()
    
    # Active entities
    active_students = User.objects.filter(role='student', status='active').count()
    active_teachers = User.objects.filter(role='teacher', status='active').count()
    active_courses = Course.objects.filter(status='published').count()
    
    # Revenue (total paid amount)
    total_revenue = Payment.objects.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0
    formatted_revenue = '{:,}'.format(total_revenue).replace(',', ' ') + " so'm"
    
    # Recent Activities
    recent_activities = ActivityLog.objects.all().order_by('-created_at')[:10]
    
    # Recent registrations (Students and Teachers)
    recent_users = User.objects.filter(role__in=['student', 'teacher']).order_by('-date_joined')[:5]
    
    # Top Courses
    top_courses = Course.objects.annotate(
        enroll_count=Count('enrollments')
    ).order_by('-enroll_count')[:5]

    context = {
        'page': 'dashboard',
        'students_count': students_count,
        'teachers_count': teachers_count,
        'courses_count': courses_count,
        'pending_payments': pending_payments,
        'active_students': active_students,
        'active_teachers': active_teachers,
        'active_courses': active_courses,
        'total_revenue': total_revenue,
        'formatted_revenue': formatted_revenue,
        'recent_activities': recent_activities,
        'recent_users': recent_users,
        'top_courses': top_courses,
    }
    return render(request, 'manager/dashboard.html', context)

@manager_required
def students_view(request):
    # Handle POST Actions (Block / Activate / Enroll)
    if request.method == 'POST':
        action = request.POST.get('action')
        student_id = request.POST.get('student_id')
        student = get_object_or_404(User, id=student_id, role='student')
        
        if action == 'toggle_status':
            if student.status == 'active':
                student.status = 'blocked'
                ActivityLog.objects.create(
                    who=request.user.get_full_name() or request.user.username,
                    role=request.user.get_role_display(),
                    action=f"O'quvchini blokladi: {student.get_full_name()}",
                    log_type='security'
                )
            else:
                student.status = 'active'
                ActivityLog.objects.create(
                    who=request.user.get_full_name() or request.user.username,
                    role=request.user.get_role_display(),
                    action=f"O'quvchini faollashtirdi: {student.get_full_name()}",
                    log_type='security'
                )
            student.save()
            messages.success(request, f"O'quvchi holati o'zgartirildi.")
            
        elif action == 'enroll':
            course_id = request.POST.get('course_id')
            course = get_object_or_404(Course, id=course_id)
            enrollment, created = Enrollment.objects.get_or_create(student=student, course=course)
            if created:
                enrollment.status = 'active'
                enrollment.save()
                ActivityLog.objects.create(
                    who=request.user.get_full_name() or request.user.username,
                    role=request.user.get_role_display(),
                    action=f"O'quvchini kursga qo'shdi: {student.get_full_name()} → {course.title}",
                    log_type='enroll'
                )
                messages.success(request, f"O'quvchi {course.title} kursiga muvaffaqiyatli yozildi.")
            else:
                messages.info(request, "O'quvchi bu kursga allaqachon yozilgan.")
                
        return redirect('manager:students')

    # Get search and filters
    search_query = request.GET.get('search', '')
    status_filter = request.GET.get('status', 'all')
    
    students = User.objects.filter(role='student')
    
    if search_query:
        students = students.filter(
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(username__icontains=search_query) |
            Q(email__icontains=search_query)
        )
        
    if status_filter != 'all':
        students = students.filter(status=status_filter)
        
    # Get all active courses for the quick enrollment modal
    all_courses = Course.objects.filter(status='published')
    
    # Calculate progress details for each student
    student_list = []
    for s in students:
        s_enrollments = Enrollment.objects.filter(student=s)
        total_courses_count = s_enrollments.count()
        
        # Calculate overall progress percentage
        completed_lessons = Progress.objects.filter(student=s).count()
        total_lessons = sum([e.course.lessons_count for e in s_enrollments])
        progress_percentage = int((completed_lessons / total_lessons * 100)) if total_lessons > 0 else 0
        
        student_list.append({
            'obj': s,
            'courses_count': total_courses_count,
            'progress': progress_percentage,
            'certs_count': Certificate.objects.filter(student=s, status='valid').count(),
        })

    context = {
        'page': 'students',
        'students': student_list,
        'all_courses': all_courses,
        'search_query': search_query,
        'status_filter': status_filter,
    }
    return render(request, 'manager/students.html', context)

@manager_required
def teachers_view(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        teacher_id = request.POST.get('teacher_id')
        teacher = get_object_or_404(User, id=teacher_id, role='teacher')
        
        if action == 'toggle_status':
            if teacher.status == 'active':
                teacher.status = 'blocked'
                ActivityLog.objects.create(
                    who=request.user.get_full_name() or request.user.username,
                    role=request.user.get_role_display(),
                    action=f"Ustozni blokladi: {teacher.get_full_name()}",
                    log_type='security'
                )
            else:
                teacher.status = 'active'
                ActivityLog.objects.create(
                    who=request.user.get_full_name() or request.user.username,
                    role=request.user.get_role_display(),
                    action=f"Ustozni faollashtirdi: {teacher.get_full_name()}",
                    log_type='security'
                )
            teacher.save()
            messages.success(request, "Ustoz holati o'zgartirildi.")
            
        elif action == 'approve_application':
            teacher.status = 'active'
            teacher.save()
            ActivityLog.objects.create(
                who=request.user.get_full_name() or request.user.username,
                role=request.user.get_role_display(),
                action=f"Ustoz arizasini tasdiqladi: {teacher.get_full_name()}",
                log_type='security'
            )
            messages.success(request, "Ustoz arizasi tasdiqlandi va hisob faollashtirildi.")
            
        return redirect('manager:teachers')

    teachers = User.objects.filter(role='teacher')
    applications = User.objects.filter(role='teacher', status='pending')
    
    teacher_list = []
    for t in teachers:
        courses = Course.objects.filter(teacher=t)
        enroll_count = Enrollment.objects.filter(course__in=courses, status='active').count()
        avg_rating = courses.aggregate(Avg('rating'))['rating__avg'] or 0.0
        
        teacher_list.append({
            'obj': t,
            'courses_count': courses.count(),
            'students_count': enroll_count,
            'rating': round(avg_rating, 2),
        })

    context = {
        'page': 'teachers',
        'teachers': teacher_list,
        'applications': applications,
    }
    return render(request, 'manager/teachers.html', context)

@manager_required
def courses_view(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        course_id = request.POST.get('course_id')
        course = get_object_or_404(Course, id=course_id)
        
        if action == 'toggle_publish':
            if course.status == 'published':
                course.status = 'draft'
                ActivityLog.objects.create(
                    who=request.user.get_full_name() or request.user.username,
                    role=request.user.get_role_display(),
                    action=f"Kursni yashirdi: {course.title}",
                    log_type='content'
                )
            else:
                course.status = 'published'
                ActivityLog.objects.create(
                    who=request.user.get_full_name() or request.user.username,
                    role=request.user.get_role_display(),
                    action=f"Kursni nashr qildi: {course.title}",
                    log_type='content'
                )
            course.save()
            messages.success(request, f"Kurs holati o'zgartirildi: {course.get_status_display()}")
            
        elif action == 'toggle_featured':
            course.featured = not course.featured
            course.save()
            messages.success(request, f"Kurs tavsiyalanganlar ro'yxatiga qo'shildi/olib tashlandi.")
            
        return redirect('manager:courses')

    courses = Course.objects.all().select_related('teacher', 'category')
    categories = Category.objects.all()
    
    context = {
        'page': 'courses',
        'courses': courses,
        'categories': categories,
    }
    return render(request, 'manager/courses.html', context)

@manager_required
def assignments_view(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        result_id = request.POST.get('result_id')
        result = get_object_or_404(TestResult, id=result_id)
        
        if action == 'grade_submission':
            score = int(request.POST.get('score', 0))
            result.score = score
            result.percentage = int((score / result.test.questions.count()) * 100) if result.test.questions.count() > 0 else 0
            result.passed = result.percentage >= result.test.pass_percent
            result.save()
            ActivityLog.objects.create(
                who=request.user.get_full_name() or request.user.username,
                role=request.user.get_role_display(),
                action=f"Test baholandi: {result.student.get_full_name()} -> {result.test.title} ({result.score} ball)",
                log_type='test'
            )
            messages.success(request, "Baholash muvaffaqiyatli saqlandi.")
            
        return redirect('manager:assignments')

    quizzes = Test.objects.all().select_related('course')
    submissions = TestResult.objects.all().select_related('student', 'test', 'test__course')

    context = {
        'page': 'assignments',
        'quizzes': quizzes,
        'submissions': submissions,
    }
    return render(request, 'manager/assignments.html', context)

@manager_required
def reports_view(request):
    # Handle Exports
    export_format = request.GET.get('export', '')
    if export_format in ['csv', 'excel']:
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="proskill_report_{timezone.now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Turi', 'Nomi/Tafsilot', 'Soni/Qiymati', 'Sana'])
        
        # Add student data
        writer.writerow(['Statistika', 'Umumiy o\'quvchilar', User.objects.filter(role='student').count(), ''])
        writer.writerow(['Statistika', 'Umumiy ustozlar', User.objects.filter(role='teacher').count(), ''])
        writer.writerow(['Statistika', 'Umumiy kurslar', Course.objects.count(), ''])
        
        # Add revenue payments
        payments = Payment.objects.filter(status='paid')
        for p in payments:
            writer.writerow(['To\'lov', f"{p.student.get_full_name()} - {p.course.title}", p.amount, p.created_at.strftime('%Y-%m-%d %H:%M')])
            
        return response
        
    elif export_format == 'pdf':
        # Simplify PDF request to a formatted HTML text print view for development/standard rendering
        response = HttpResponse(content_type='text/html')
        response.write('<html><head><title>ProSkill LMS Report</title><style>body{font-family:sans-serif;padding:30px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f4f5fb;}</style></head><body>')
        response.write('<h1>ProSkill IT Academy — Analitik hisobot</h1>')
        response.write(f'<p>Chop etilgan sana: {timezone.now().strftime("%Y-%m-%d %H:%M")}</p>')
        response.write('<h2>Umumiy ko\'rsatkichlar</h2>')
        response.write('<table><tr><th>Ko\'rsatkich</th><th>Qiymat</th></tr>')
        response.write(f'<tr><td>O\'quvchilar soni</td><td>{User.objects.filter(role="student").count()}</td></tr>')
        response.write(f'<tr><td>Ustozlar soni</td><td>{User.objects.filter(role="teacher").count()}</td></tr>')
        response.write(f'<tr><td>Kurslar soni</td><td>{Course.objects.count()}</td></tr>')
        revenue = Payment.objects.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0
        response.write(f'<tr><td>Jami daromad</td><td>{revenue} so\'m</td></tr>')
        response.write('</table></body></html>')
        return response

    # Get data for reports dashboard charts
    courses = Course.objects.annotate(students=Count('enrollments')).order_by('-students')
    teachers = User.objects.filter(role='teacher')
    
    teacher_stats = []
    for t in teachers:
        tc = Course.objects.filter(teacher=t)
        teacher_stats.append({
            'name': t.get_full_name() or t.username,
            'courses': tc.count(),
            'rating': tc.aggregate(Avg('rating'))['rating__avg'] or 0.0,
            'students': Enrollment.objects.filter(course__in=tc).count(),
        })

    context = {
        'page': 'reports',
        'courses': courses,
        'teacher_stats': teacher_stats,
    }
    return render(request, 'manager/reports.html', context)

@manager_required
def support_view(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        ticket_id = request.POST.get('ticket_id')
        ticket = get_object_or_404(StudentQuestion, id=ticket_id)
        
        if action == 'reply_ticket':
            answer = request.POST.get('answer', '')
            ticket.answer = answer
            ticket.status = 'answered'
            ticket.save()
            ActivityLog.objects.create(
                who=request.user.get_full_name() or request.user.username,
                role=request.user.get_role_display(),
                action=f"Savolga javob berdi: {ticket.student.get_full_name()} -> {ticket.text[:30]}...",
                log_type='content'
            )
            messages.success(request, "Javob muvaffaqiyatli yuborildi.")
            
        return redirect('manager:support')

    tickets = StudentQuestion.objects.all().select_related('student', 'course')
    open_tickets = tickets.filter(status='unanswered')
    closed_tickets = tickets.filter(status='answered')

    context = {
        'page': 'support',
        'tickets': tickets,
        'open_tickets': open_tickets,
        'closed_tickets': closed_tickets,
    }
    return render(request, 'manager/support.html', context)

@manager_required
def profile_view(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        user = request.user
        
        if action == 'update_profile':
            user.first_name = request.POST.get('first_name', '')
            user.last_name = request.POST.get('last_name', '')
            user.email = request.POST.get('email', '')
            user.phone = request.POST.get('phone', '')
            user.bio = request.POST.get('bio', '')
            user.save()
            messages.success(request, "Profil ma'lumotlari muvaffaqiyatli yangilandi.")
            
        elif action == 'change_password':
            password = request.POST.get('password', '')
            confirm_password = request.POST.get('confirm_password', '')
            
            if password and password == confirm_password:
                user.password = make_password(password)
                user.save()
                update_session_auth_hash(request, user)
                messages.success(request, "Parol muvaffaqiyatli o'zgartirildi.")
            else:
                messages.error(request, "Kiritilgan parollar mos kelmadi.")
                
        return redirect('manager:profile')

    context = {
        'page': 'profile',
        'user': request.user,
    }
    return render(request, 'manager/profile.html', context)
