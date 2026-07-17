"""
ProSkill IT Academy — Seed Data Command
proskill-db.js dagi barcha ma'lumotlarni Django DB ga yuklaydi.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from courses.models import Category, Course, Module, Lesson
from enrollments.models import Enrollment, Progress
from payments.models import Payment
from tests_app.models import Test, Question, TestResult
from notifications.models import Notification
from core.models import ActivityLog, PlatformSettings, Review, StudentQuestion, Certificate


class Command(BaseCommand):
    help = "ProSkill IT Academy uchun test ma'lumotlarni yuklaydi (proskill-db.js asosida)"

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help="Avval barcha ma'lumotlarni o'chiradi",
        )

    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write("Barcha ma'lumotlar o'chirilmoqda...")
            Certificate.objects.all().delete()
            TestResult.objects.all().delete()
            Question.objects.all().delete()
            Test.objects.all().delete()
            Progress.objects.all().delete()
            Enrollment.objects.all().delete()
            Payment.objects.all().delete()
            Notification.objects.all().delete()
            StudentQuestion.objects.all().delete()
            Review.objects.all().delete()
            ActivityLog.objects.all().delete()
            Lesson.objects.all().delete()
            Module.objects.all().delete()
            Course.objects.all().delete()
            Category.objects.all().delete()
            User.objects.exclude(is_superuser=True).delete()

        self.stdout.write("Ma'lumotlar yuklanmoqda...")

        # ==================== USERS ====================
        users_data = [
            {"username": "admin", "email": "admin@proskill.uz", "password": "admin",
             "first_name": "Super", "last_name": "Admin", "role": "superadmin",
             "status": "active", "joined_label": "12 Yan 2025", "last_seen": "Hozir"},

            {"username": "jasur", "email": "jasur@proskill.uz", "password": "manager",
             "first_name": "Jasur", "last_name": "Toshmatov", "role": "manager",
             "status": "active", "joined_label": "14 Mar 2025", "last_seen": "1 soat oldin"},

            {"username": "kamola", "email": "kamola@proskill.uz", "password": "manager",
             "first_name": "Kamola", "last_name": "Saidova", "role": "manager",
             "status": "active", "joined_label": "09 Yan 2025", "last_seen": "30 daqiqa oldin"},

            {"username": "sardor", "email": "sardor@proskill.uz", "password": "teacher",
             "first_name": "Sardor", "last_name": "Aliyev", "role": "teacher",
             "status": "active", "joined_label": "12 Yan 2025", "last_seen": "2 soat oldin",
             "bio": "Senior Python & Backend dasturchi, 8 yil tajriba",
             "specialization": "Python, Django, Backend"},

            {"username": "dilnoza", "email": "dilnoza@proskill.uz", "password": "teacher",
             "first_name": "Dilnoza", "last_name": "Karimova", "role": "teacher",
             "status": "active", "joined_label": "03 Fev 2025", "last_seen": "5 soat oldin",
             "bio": "Frontend mutaxassis, React eksperti",
             "specialization": "Frontend, React"},

            {"username": "aziza", "email": "aziza@proskill.uz", "password": "teacher",
             "first_name": "Aziza", "last_name": "Rahimova", "role": "teacher",
             "status": "active", "joined_label": "18 Yan 2025", "last_seen": "Kecha",
             "bio": "Data Science & AI tadqiqotchisi",
             "specialization": "Data Science, AI"},

            {"username": "madina", "email": "madina@proskill.uz", "password": "teacher",
             "first_name": "Madina", "last_name": "Yusupova", "role": "teacher",
             "status": "active", "joined_label": "22 Fev 2025", "last_seen": "3 kun oldin",
             "bio": "Grafik dizayner, Figma trener",
             "specialization": "Grafik dizayn"},

            {"username": "aziz", "email": "aziz@gmail.com", "password": "student",
             "first_name": "Aziz", "last_name": "Karimov", "role": "student",
             "status": "active", "joined_label": "02 May 2026", "last_seen": "10 daqiqa oldin",
             "phone": "+998 90 123 45 67"},

            {"username": "gulnora", "email": "gulnora@gmail.com", "password": "student",
             "first_name": "Gulnora", "last_name": "Saidova", "role": "student",
             "status": "active", "joined_label": "05 May 2026", "last_seen": "1 soat oldin"},

            {"username": "shoxruh", "email": "shoxruh@gmail.com", "password": "student",
             "first_name": "Shoxruh", "last_name": "Mirzaev", "role": "student",
             "status": "pending", "joined_label": "16 Iyun 2026", "last_seen": "2 soat oldin"},

            {"username": "nilufar", "email": "nilufar@gmail.com", "password": "student",
             "first_name": "Nilufar", "last_name": "Tosheva", "role": "student",
             "status": "active", "joined_label": "21 Apr 2026", "last_seen": "Kecha"},

            {"username": "dilshod", "email": "dilshod@gmail.com", "password": "student",
             "first_name": "Dilshod", "last_name": "Karimov", "role": "student",
             "status": "active", "joined_label": "30 Apr 2026", "last_seen": "4 soat oldin"},

            {"username": "bobur", "email": "bobur@gmail.com", "password": "student",
             "first_name": "Bobur", "last_name": "Aliyev", "role": "student",
             "status": "blocked", "joined_label": "11 Apr 2026", "last_seen": "2 hafta oldin"},
        ]

        user_map = {}  # email -> User
        for ud in users_data:
            email = ud['email']
            if User.objects.filter(email=email).exists():
                user_map[email] = User.objects.get(email=email)
                self.stdout.write(f"  [OK] User mavjud: {email}")
                continue

            user = User(
                username=ud['username'],
                email=email,
                first_name=ud['first_name'],
                last_name=ud['last_name'],
                role=ud['role'],
                status=ud['status'],
                joined_label=ud.get('joined_label', ''),
                last_seen=ud.get('last_seen', 'Hozir'),
                phone=ud.get('phone', ''),
                bio=ud.get('bio', ''),
                specialization=ud.get('specialization', ''),
            )
            user.set_password(ud['password'])
            if ud['role'] == 'superadmin':
                user.is_staff = True
                user.is_superuser = True
            user.save()
            user_map[email] = user
            self.stdout.write(f"  + User yaratildi: {email} ({ud['role']})")

        # Shortcut references
        sardor = user_map['sardor@proskill.uz']
        dilnoza = user_map['dilnoza@proskill.uz']
        aziza = user_map['aziza@proskill.uz']
        madina = user_map['madina@proskill.uz']
        aziz = user_map['aziz@gmail.com']
        gulnora = user_map['gulnora@gmail.com']
        shoxruh = user_map['shoxruh@gmail.com']
        nilufar = user_map['nilufar@gmail.com']
        dilshod = user_map['dilshod@gmail.com']
        bobur = user_map['bobur@gmail.com']

        # ==================== CATEGORIES ====================
        categories_data = [
            ("Python", True), ("Frontend", True), ("Backend", True),
            ("Grafik dizayn", True), ("SMM", True), ("Data Science", True),
            ("Sun'iy intellekt", True), ("Mobil dasturlash", True),
            ("Ingliz tili", True), ("Kompyuter savodxonligi", False),
        ]
        cat_map = {}
        for name, active in categories_data:
            cat, _ = Category.objects.get_or_create(name=name, defaults={'active': active})
            cat_map[name] = cat

        self.stdout.write(f"  [OK] {len(cat_map)} ta kategoriya")

        # ==================== COURSES ====================
        courses_data = [
            {"title": "Python — 0 dan Professionalgacha", "cat": "Python", "teacher": sardor,
             "price": 690000, "rating": 4.9, "level": "boshlangich", "status": "published",
             "featured": True, "desc": "Python dasturlashni noldan professional darajagacha o'rganing."},

            {"title": "Backend: Django va REST API", "cat": "Backend", "teacher": sardor,
             "price": 990000, "rating": 4.9, "level": "professional", "status": "published",
             "featured": False, "desc": "Django va REST API bilan kuchli backend qurish."},

            {"title": "Frontend: HTML, CSS, JS, React", "cat": "Frontend", "teacher": dilnoza,
             "price": 890000, "rating": 4.8, "level": "orta", "status": "published",
             "featured": True, "desc": "Zamonaviy frontend: React bilan interfeys yaratish."},

            {"title": "Grafik dizayn: Figma & Photoshop", "cat": "Grafik dizayn", "teacher": madina,
             "price": 590000, "rating": 4.7, "level": "boshlangich", "status": "published",
             "featured": False, "desc": "Figma va Photoshopda professional dizayn."},

            {"title": "SMM va Raqamli Marketing", "cat": "SMM", "teacher": madina,
             "price": 490000, "rating": 4.6, "level": "boshlangich", "status": "published",
             "featured": True, "desc": "Ijtimoiy tarmoqlarda marketing strategiyasi."},

            {"title": "Data Science va Analitika", "cat": "Data Science", "teacher": aziza,
             "price": 1190000, "rating": 4.9, "level": "professional", "status": "published",
             "featured": False, "desc": "Ma'lumotlar tahlili va Data Science asoslari."},

            {"title": "Mobil dasturlash: Flutter", "cat": "Mobil dasturlash", "teacher": dilnoza,
             "price": 990000, "rating": 4.8, "level": "orta", "status": "published",
             "featured": False, "desc": "Flutter bilan iOS va Android ilovalar."},

            {"title": "IT uchun Ingliz tili", "cat": "Ingliz tili", "teacher": aziza,
             "price": 390000, "rating": 4.7, "level": "boshlangich", "status": "published",
             "featured": False, "desc": "Dasturchilar uchun texnik ingliz tili."},

            {"title": "Kompyuter savodxonligi", "cat": "Kompyuter savodxonligi", "teacher": madina,
             "price": 0, "rating": 4.5, "level": "boshlangich", "status": "published",
             "featured": False, "desc": "Kompyuterda ishlash asoslari — bepul."},

            {"title": "Python OOP — chuqurlashtirilgan", "cat": "Python", "teacher": sardor,
             "price": 790000, "rating": 0, "level": "professional", "status": "pending",
             "featured": False, "desc": "OOP tamoyillari chuqur."},

            {"title": "FastAPI bilan mikroservislar", "cat": "Backend", "teacher": sardor,
             "price": 1090000, "rating": 0, "level": "professional", "status": "draft",
             "featured": False, "desc": "Mikroservis arxitekturasi."},
        ]

        course_map = {}
        for cd in courses_data:
            course, created = Course.objects.get_or_create(
                title=cd['title'],
                defaults={
                    'category': cat_map[cd['cat']],
                    'teacher': cd['teacher'],
                    'price': cd['price'],
                    'rating': cd['rating'],
                    'level': cd['level'],
                    'status': cd['status'],
                    'featured': cd['featured'],
                    'description': cd['desc'],
                }
            )
            course_map[cd['title']] = course

        self.stdout.write(f"  [OK] {len(course_map)} ta kurs")

        # ==================== MODULES & LESSONS ====================
        module_templates = [
            ("Modul 1 — Kirish va asoslar", ["Kursga kirish va tanishuv", "Ish muhitini sozlash", "Birinchi dastur"]),
            ("Modul 2 — Amaliy mavzular", ["Asosiy tushunchalar", "Amaliy mashq 1", "Mini loyiha"]),
            ("Modul 3 — Professional daraja", ["Ilg'or texnikalar", "Real loyiha ustida ish", "Yakuniy test va sertifikat"]),
        ]

        for course in course_map.values():
            if course.modules.exists():
                continue
            if course.status == 'draft':
                mod_count = 1
            elif course.status == 'pending':
                mod_count = 2
            else:
                mod_count = 3

            for mi in range(mod_count):
                mod_title, lesson_titles = module_templates[mi]
                module = Module.objects.create(course=course, title=mod_title, order=mi)
                for li, lt in enumerate(lesson_titles):
                    duration_min = 8 + ((mi * 3 + li) % 14)
                    duration_sec = (li * 17) % 60
                    Lesson.objects.create(
                        module=module, course=course, title=lt,
                        duration=f"{duration_min}:{duration_sec:02d}",
                        is_free=(mi == 0 and li == 0), order=li,
                    )

        total_lessons = Lesson.objects.count()
        self.stdout.write(f"  [OK] {Module.objects.count()} modul, {total_lessons} dars")

        # ==================== ENROLLMENTS ====================
        py_course = course_map["Python — 0 dan Professionalgacha"]
        gd_course = course_map["Grafik dizayn: Figma & Photoshop"]
        komp_course = course_map["Kompyuter savodxonligi"]
        fe_course = course_map["Frontend: HTML, CSS, JS, React"]

        enrollments_data = [
            (aziz, py_course, "paid"), (aziz, gd_course, "paid"), (aziz, komp_course, "free"),
            (gulnora, fe_course, "paid"), (nilufar, py_course, "paid"),
        ]
        for student, course, etype in enrollments_data:
            Enrollment.objects.get_or_create(student=student, course=course,
                                             defaults={'type': etype, 'status': 'active'})

        self.stdout.write(f"  [OK] {Enrollment.objects.count()} ta yozilish")

        # ==================== PROGRESS ====================
        def complete_n(student, course, n):
            lessons = list(Lesson.objects.filter(course=course).order_by('module__order', 'order')[:n])
            for lesson in lessons:
                Progress.objects.get_or_create(student=student, lesson=lesson)

        complete_n(aziz, py_course, 6)
        complete_n(aziz, gd_course, 9)
        complete_n(aziz, komp_course, 2)
        complete_n(nilufar, py_course, 9)
        complete_n(gulnora, fe_course, 4)

        self.stdout.write(f"  [OK] {Progress.objects.count()} ta progress")

        # ==================== PAYMENTS ====================
        payments_data = [
            ("#10247", aziz, py_course, 690000, "payme", "paid", ""),
            ("#10231", aziz, gd_course, 590000, "click", "paid", ""),
            ("#10246", gulnora, fe_course, 890000, "click", "paid", ""),
            ("#10245", shoxruh, course_map["Backend: Django va REST API"], 990000, "uzcard", "pending", ""),
            ("#10244", dilshod, course_map["SMM va Raqamli Marketing"], 490000, "humo", "pending", ""),
            ("#10242", bobur, course_map["Data Science va Analitika"], 1190000, "click", "failed",
             "Karta mablag'i yetarli emas."),
        ]
        for order_num, student, course, amount, method, pstatus, reason in payments_data:
            Payment.objects.get_or_create(
                order_number=order_num,
                defaults={
                    'student': student, 'course': course, 'amount': amount,
                    'method': method, 'status': pstatus, 'reason': reason,
                }
            )

        self.stdout.write(f"  [OK] {Payment.objects.count()} ta to'lov")

        # ==================== TESTS ====================
        tests_data = [
            {"course": py_course, "module_ref": "Modul 1",
             "title": "Python asoslari — Test 1", "pass_percent": 60,
             "questions": [
                 {"q": "Python'da o'zgaruvchi qanday e'lon qilinadi?",
                  "options": ["var x = 5", "x = 5", "int x = 5", "let x = 5"], "correct": 1},
                 {"q": "Ro'yxat (list) qaysi qavs bilan yoziladi?",
                  "options": ["()", "{}", "[]", "<>"], "correct": 2},
                 {"q": "print() nima qiladi?",
                  "options": ["O'chiradi", "Ekranga chiqaradi", "Saqlaydi", "Hisoblaydi"], "correct": 1},
                 {"q": "len() funksiyasi nimani qaytaradi?",
                  "options": ["Yig'indi", "Uzunlik", "Maksimum", "Tur"], "correct": 1},
                 {"q": "Izoh qaysi belgi bilan yoziladi?",
                  "options": ["//", "#", "/* */", "--"], "correct": 1},
             ]},
            {"course": py_course, "module_ref": "Modul 2",
             "title": "OOP va funksiyalar — Test 2", "pass_percent": 70,
             "questions": [
                 {"q": "Funksiya qaysi kalit so'z bilan aniqlanadi?",
                  "options": ["func", "def", "function", "fn"], "correct": 1},
                 {"q": "Class'dan obyekt qanday yaratiladi?",
                  "options": ["new Class()", "Class()", "create Class", "Class.new"], "correct": 1},
                 {"q": "self nimani bildiradi?",
                  "options": ["Klass", "Obyektning o'zi", "Funksiya", "Modul"], "correct": 1},
             ]},
            {"course": py_course, "module_ref": "Modul 3",
             "title": "Yakuniy imtihon", "pass_percent": 70,
             "questions": [
                 {"q": "Exception qanday ushlanadi?",
                  "options": ["try/except", "if/else", "for/in", "with/as"], "correct": 0},
                 {"q": "Modul qanday import qilinadi?",
                  "options": ["include x", "import x", "use x", "require x"], "correct": 1},
             ]},
            {"course": gd_course, "module_ref": "Modul 1",
             "title": "Dizayn asoslari — Test", "pass_percent": 60,
             "questions": [
                 {"q": "Figma nima uchun ishlatiladi?",
                  "options": ["Video montaj", "UI/UX dizayn", "Dasturlash", "Hisob-kitob"], "correct": 1},
                 {"q": "RGB nimaning qisqartmasi?",
                  "options": ["Red Green Blue", "Right Good Best", "Run Get Build", "Real Graphic Base"], "correct": 0},
             ]},
        ]

        test_map = {}
        for td in tests_data:
            test, created = Test.objects.get_or_create(
                title=td['title'],
                defaults={
                    'course': td['course'],
                    'module_ref': td['module_ref'],
                    'pass_percent': td['pass_percent'],
                    'active': True,
                }
            )
            test_map[td['title']] = test
            if created:
                for i, qd in enumerate(td['questions']):
                    Question.objects.create(
                        test=test, text=qd['q'],
                        options=qd['options'], correct=qd['correct'], order=i,
                    )

        self.stdout.write(f"  [OK] {Test.objects.count()} ta test, {Question.objects.count()} savol")

        # ==================== TEST RESULTS ====================
        results_data = [
            (aziz, "Python asoslari — Test 1", 85, 4, 1, True),
            (aziz, "OOP va funksiyalar — Test 2", 72, 2, 1, True),
            (aziz, "Dizayn asoslari — Test", 90, 2, 0, True),
        ]
        for student, test_title, pct, correct, wrong, passed in results_data:
            test = test_map.get(test_title)
            if test:
                TestResult.objects.get_or_create(
                    student=student, test=test,
                    defaults={
                        'score': pct, 'correct_count': correct, 'wrong_count': wrong,
                        'percentage': pct, 'passed': passed,
                    }
                )

        self.stdout.write(f"  [OK] {TestResult.objects.count()} ta test natija")

        # ==================== CERTIFICATES ====================
        certs_data = [
            ("PSK-2026-0418", aziz, gd_course),
            ("PSK-2026-0402", nilufar, py_course),
        ]
        for cert_id, student, course in certs_data:
            Certificate.objects.get_or_create(
                certificate_id=cert_id,
                defaults={'student': student, 'course': course, 'status': 'valid'}
            )

        self.stdout.write(f"  [OK] {Certificate.objects.count()} ta sertifikat")

        # ==================== REVIEWS ====================
        reviews_data = [
            (aziz, gd_course, 5, "Ajoyib kurs! Figma'ni noldan o'rgandim va endi freelance qilyapman.", ""),
            (nilufar, py_course, 5, "Eng yaxshi Python kursi! Ustoz juda tushunarli tushuntiradi.", "Rahmat, Nilufar! Omad!"),
            (gulnora, fe_course, 4, "Yaxshi kurs, lekin ba'zi darslar tezroq o'tilsa edi.", ""),
        ]
        for student, course, rating, text, reply in reviews_data:
            Review.objects.get_or_create(
                student=student, course=course,
                defaults={'rating': rating, 'text': text, 'reply': reply, 'status': 'visible'}
            )

        self.stdout.write(f"  [OK] {Review.objects.count()} ta sharh")

        # ==================== QUESTIONS ====================
        questions_data = [
            (aziz, py_course, sardor, "3-modul, 2-dars",
             "List comprehension va generator o'rtasidagi farq nima?",
             "answered",
             "List comprehension darhol ro'yxat yaratadi, generator esa elementlarni talab bo'yicha qaytaradi va xotirani tejaydi."),
            (aziz, py_course, sardor, "2-modul, 4-dars",
             "Dekoratorlarni qachon ishlatish kerak?",
             "unanswered", ""),
            (dilshod, course_map["SMM va Raqamli Marketing"], madina, "1-modul, 3-dars",
             "Target auditoriyani qanday aniqlayman?",
             "answered",
             "Mahsulot kim uchun foydali ekanini yozing, keyin yosh va qiziqish bo'yicha segmentlang."),
        ]
        for student, course, teacher, lesson_ref, text, qstatus, answer in questions_data:
            StudentQuestion.objects.get_or_create(
                student=student, course=course, text=text,
                defaults={
                    'teacher': teacher, 'lesson_ref': lesson_ref,
                    'answer': answer, 'status': qstatus,
                }
            )

        self.stdout.write(f"  [OK] {StudentQuestion.objects.count()} ta savol")

        # ==================== NOTIFICATIONS ====================
        notifs_data = [
            (aziz, "Xush kelibsiz!", "ProSkill IT Academy'ga xush kelibsiz. O'qishni boshlang!", True),
            (aziz, "Sertifikat tayyor", "Grafik dizayn kursi sertifikatingiz tayyor.", False),
        ]
        for user, title, text, read in notifs_data:
            Notification.objects.get_or_create(
                user=user, title=title,
                defaults={'text': text, 'read': read}
            )

        self.stdout.write(f"  [OK] {Notification.objects.count()} ta bildirishnoma")

        # ==================== ACTIVITY LOG ====================
        ActivityLog.objects.get_or_create(
            who="Super Admin", role="superadmin",
            action="Tizimni ishga tushirdi", target="Platforma",
            defaults={'log_type': 'settings'}
        )

        # ==================== PLATFORM SETTINGS ====================
        PlatformSettings.load()

        self.stdout.write(self.style.SUCCESS(
            "\n[SUCCESS] Barcha ma'lumotlar muvaffaqiyatli yuklandi!\n"
            f"   Foydalanuvchilar: {User.objects.count()}\n"
            f"   Kurslar: {Course.objects.count()}\n"
            f"   Darslar: {Lesson.objects.count()}\n"
            f"   Yozilishlar: {Enrollment.objects.count()}\n"
            f"   To'lovlar: {Payment.objects.count()}\n"
            f"   Testlar: {Test.objects.count()}\n"
            f"   Sertifikatlar: {Certificate.objects.count()}"
        ))
