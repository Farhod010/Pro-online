/* ============================================================
   ProSkill IT Academy — umumiy "ma'lumotlar bazasi" qatlami
   localStorage asosida ishlaydi. Barcha 5 panel shu modulni
   o'qiydi/yozadi -> cross-panel real flow ta'minlanadi.
   window.ProSkillDB sifatida global ochiladi.
   ============================================================ */
(function () {
  var DB_KEY = "proskill_db_v1";
  var SESSION_KEY = "proskill_session_v1";

  function uid(p) { return (p || "id") + "_" + Math.random().toString(36).slice(2, 8); }
  function nowISO() { return new Date().toISOString(); }
  function todayLabel() {
    var d = new Date();
    var months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }
  function timeLabel() {
    var d = new Date();
    return ("0" + d.getDate()).slice(-2) + " " + ["Yan","Fev","Mar","Apr","May","Iyun","Iyul","Avg","Sen","Okt","Noy","Dek"][d.getMonth()] + ", " + ("0"+d.getHours()).slice(-2) + ":" + ("0"+d.getMinutes()).slice(-2);
  }

  // ---------- SEED ----------
  function seed() {
    var users = [
      { id: "u_admin",   name: "Super Admin",      email: "admin@proskill.uz",   password: "admin",   role: "superadmin", status: "active",  joined: "12 Yan 2025", last: "Hozir" },
      { id: "u_mgr1",    name: "Jasur Toshmatov",  email: "jasur@proskill.uz",   password: "manager", role: "manager",    status: "active",  joined: "14 Mar 2025", last: "1 soat oldin" },
      { id: "u_mgr2",    name: "Kamola Saidova",   email: "kamola@proskill.uz",  password: "manager", role: "manager",    status: "active",  joined: "09 Yan 2025", last: "30 daqiqa oldin" },
      { id: "u_tch1",    name: "Sardor Aliyev",    email: "sardor@proskill.uz",  password: "teacher", role: "teacher",    status: "active",  joined: "12 Yan 2025", last: "2 soat oldin", bio: "Senior Python & Backend dasturchi, 8 yil tajriba", spec: "Python, Django, Backend", phone: "+998 90 111 22 33", experience: "8 yil", certificates: "AWS, Django Certified", payoutRate: 40 },
      { id: "u_tch2",    name: "Dilnoza Karimova", email: "dilnoza@proskill.uz", password: "teacher", role: "teacher",    status: "active",  joined: "03 Fev 2025", last: "5 soat oldin", bio: "Frontend mutaxassis, React eksperti", spec: "Frontend, React", phone: "+998 91 222 33 44", experience: "6 yil", certificates: "Meta Frontend", payoutRate: 40 },
      { id: "u_tch3",    name: "Aziza Rahimova",   email: "aziza@proskill.uz",   password: "teacher", role: "teacher",    status: "active",  joined: "18 Yan 2025", last: "Kecha", bio: "Data Science & AI tadqiqotchisi", spec: "Data Science, AI", phone: "+998 93 333 44 55", experience: "7 yil", certificates: "Google Data Analytics", payoutRate: 45 },
      { id: "u_tch4",    name: "Madina Yusupova",  email: "madina@proskill.uz",  password: "teacher", role: "teacher",    status: "active",  joined: "22 Fev 2025", last: "3 kun oldin", bio: "Grafik dizayner, Figma trener", spec: "Grafik dizayn", phone: "+998 94 444 55 66", experience: "5 yil", certificates: "Adobe Certified", payoutRate: 35 },
      { id: "u_std1",    name: "Aziz Karimov",     email: "aziz@gmail.com",      password: "student", role: "student",    status: "active",  joined: "02 May 2026", last: "10 daqiqa oldin", phone: "+998 90 123 45 67" },
      { id: "u_std2",    name: "Gulnora Saidova",  email: "gulnora@gmail.com",   password: "student", role: "student",    status: "active",  joined: "05 May 2026", last: "1 soat oldin" },
      { id: "u_std3",    name: "Shoxruh Mirzaev",  email: "shoxruh@gmail.com",   password: "student", role: "student",    status: "pending", joined: "16 Iyun 2026", last: "2 soat oldin" },
      { id: "u_std4",    name: "Nilufar Tosheva",  email: "nilufar@gmail.com",   password: "student", role: "student",    status: "active",  joined: "21 Apr 2026", last: "Kecha" },
      { id: "u_std5",    name: "Dilshod Karimov",  email: "dilshod@gmail.com",   password: "student", role: "student",    status: "active",  joined: "30 Apr 2026", last: "4 soat oldin" },
      { id: "u_std6",    name: "Bobur Aliyev",     email: "bobur@gmail.com",     password: "student", role: "student",    status: "blocked", joined: "11 Apr 2026", last: "2 hafta oldin" }
    ];

    var categories = [
      { id: "cat_py",  name: "Python", active: true },
      { id: "cat_fe",  name: "Frontend", active: true },
      { id: "cat_be",  name: "Backend", active: true },
      { id: "cat_gd",  name: "Grafik dizayn", active: true },
      { id: "cat_smm", name: "SMM", active: true },
      { id: "cat_ds",  name: "Data Science", active: true },
      { id: "cat_ai",  name: "Sun'iy intellekt", active: true },
      { id: "cat_mob", name: "Mobil dasturlash", active: true },
      { id: "cat_eng", name: "Ingliz tili", active: true },
      { id: "cat_comp",name: "Kompyuter savodxonligi", active: false }
    ];

    var courses = [
      { id: "t1",  title: "Python — 0 dan Professionalgacha", cat: "Python",        teacherId: "u_tch1", price: 690000,  rating: 4.9, level: "Boshlang'ich", status: "published", featured: true,  desc: "Python dasturlashni noldan professional darajagacha o'rganing." },
      { id: "t2",  title: "Backend: Django va REST API",       cat: "Backend",       teacherId: "u_tch1", price: 990000,  rating: 4.9, level: "Professional", status: "published", featured: false, desc: "Django va REST API bilan kuchli backend qurish." },
      { id: "c2",  title: "Frontend: HTML, CSS, JS, React",    cat: "Frontend",      teacherId: "u_tch2", price: 890000,  rating: 4.8, level: "O'rta",        status: "published", featured: true,  desc: "Zamonaviy frontend: React bilan interfeys yaratish." },
      { id: "c4",  title: "Grafik dizayn: Figma & Photoshop",  cat: "Grafik dizayn", teacherId: "u_tch4", price: 590000,  rating: 4.7, level: "Boshlang'ich", status: "published", featured: false, desc: "Figma va Photoshopda professional dizayn." },
      { id: "c5",  title: "SMM va Raqamli Marketing",          cat: "SMM",           teacherId: "u_tch4", price: 490000,  rating: 4.6, level: "Boshlang'ich", status: "published", featured: true,  desc: "Ijtimoiy tarmoqlarda marketing strategiyasi." },
      { id: "c6",  title: "Data Science va Analitika",         cat: "Data Science",  teacherId: "u_tch3", price: 1190000, rating: 4.9, level: "Professional", status: "published", featured: false, desc: "Ma'lumotlar tahlili va Data Science asoslari." },
      { id: "c8",  title: "Mobil dasturlash: Flutter",         cat: "Mobil dasturlash", teacherId: "u_tch2", price: 990000, rating: 4.8, level: "O'rta",     status: "published", featured: false, desc: "Flutter bilan iOS va Android ilovalar." },
      { id: "c9",  title: "IT uchun Ingliz tili",              cat: "Ingliz tili",   teacherId: "u_tch3", price: 390000,  rating: 4.7, level: "Boshlang'ich", status: "published", featured: false, desc: "Dasturchilar uchun texnik ingliz tili." },
      { id: "c10", title: "Kompyuter savodxonligi",            cat: "Kompyuter savodxonligi", teacherId: "u_tch4", price: 0, rating: 4.5, level: "Boshlang'ich", status: "published", featured: false, desc: "Kompyuterda ishlash asoslari — bepul." },
      { id: "t3",  title: "Python OOP — chuqurlashtirilgan",   cat: "Python",        teacherId: "u_tch1", price: 790000,  rating: 0,   level: "Professional", status: "pending",   featured: false, desc: "OOP tamoyillari chuqur." },
      { id: "t4",  title: "FastAPI bilan mikroservislar",      cat: "Backend",       teacherId: "u_tch1", price: 1090000, rating: 0,   level: "Professional", status: "draft",     featured: false, desc: "Mikroservis arxitekturasi." }
    ];

    // modules & lessons
    var modules = [], lessons = [];
    var lessonTitles = [
      ["Modul 1 — Kirish va asoslar", ["Kursga kirish va tanishuv", "Ish muhitini sozlash", "Birinchi dastur"]],
      ["Modul 2 — Amaliy mavzular", ["Asosiy tushunchalar", "Amaliy mashq 1", "Mini loyiha"]],
      ["Modul 3 — Professional daraja", ["Ilg'or texnikalar", "Real loyiha ustida ish", "Yakuniy test va sertifikat"]]
    ];
    courses.forEach(function (c) {
      var mcount = c.status === "draft" ? 1 : (c.status === "pending" ? 2 : 3);
      for (var mi = 0; mi < mcount; mi++) {
        var modId = "mod_" + c.id + "_" + mi;
        modules.push({ id: modId, courseId: c.id, title: lessonTitles[mi][0], order: mi });
        lessonTitles[mi][1].forEach(function (lt, li) {
          // Demo video URL for first lesson of each module (preview / student play)
          var demoUrl = (li === 0)
            ? ("https://www.youtube.com/watch?v=rfscVS0vtbw&t=" + ((mi + 1) * 60))
            : "";
          lessons.push({
            id: "les_" + c.id + "_" + mi + "_" + li,
            moduleId: modId, courseId: c.id, title: lt,
            duration: (8 + ((mi * 3 + li) % 14)) + ":" + ("0" + ((li * 17) % 60)).slice(-2),
            free: (mi === 0 && li === 0), order: li,
            videoUrl: demoUrl
          });
        });
      }
    });

    // enrollments for Aziz (u_std1)
    var enrollments = [
      { id: uid("enr"), studentId: "u_std1", courseId: "t1", type: "paid", status: "active", createdAt: "02 May 2026" },
      { id: uid("enr"), studentId: "u_std1", courseId: "c4", type: "paid", status: "active", createdAt: "21 Apr 2026" },
      { id: uid("enr"), studentId: "u_std1", courseId: "c10", type: "free", status: "active", createdAt: "01 Iyun 2026" },
      { id: uid("enr"), studentId: "u_std2", courseId: "c2", type: "paid", status: "active", createdAt: "06 May 2026" },
      { id: uid("enr"), studentId: "u_std4", courseId: "t1", type: "paid", status: "active", createdAt: "21 Apr 2026" }
    ];

    // progress: completed lesson ids per student
    var progress = []; // {studentId, lessonId}
    // Aziz: t1 -> 37/52-ish; we have fewer lessons (9 per course); complete some
    function complete(studentId, courseId, count) {
      var ls = lessons.filter(function (l) { return l.courseId === courseId; });
      for (var i = 0; i < count && i < ls.length; i++) progress.push({ studentId: studentId, lessonId: ls[i].id });
    }
    complete("u_std1", "t1", 6);   // ~67%
    complete("u_std1", "c4", 9);   // 100%
    complete("u_std1", "c10", 2);  // ~22%
    complete("u_std4", "t1", 9);   // 100%
    complete("u_std2", "c2", 4);

    // payments
    var payments = [
      { id: "#10247", studentId: "u_std1", courseId: "t1", amount: 690000, method: "Payme", status: "paid", date: "02 May 2026", reason: "" },
      { id: "#10231", studentId: "u_std1", courseId: "c4", amount: 590000, method: "Click", status: "paid", date: "21 Apr 2026", reason: "" },
      { id: "#10246", studentId: "u_std2", courseId: "c2", amount: 890000, method: "Click", status: "paid", date: "06 May 2026", reason: "" },
      { id: "#10245", studentId: "u_std3", courseId: "t2", amount: 990000, method: "Uzcard", status: "pending", date: "18 Iyun 2026", reason: "" },
      { id: "#10244", studentId: "u_std5", courseId: "c5", amount: 490000, method: "Humo", status: "pending", date: "18 Iyun 2026", reason: "" },
      { id: "#10242", studentId: "u_std6", courseId: "c6", amount: 1190000, method: "Click", status: "failed", date: "15 Iyun 2026", reason: "Karta mablag'i yetarli emas." }
    ];

    // tests
    var tests = [
      { id: "tst_1", courseId: "t1", moduleRef: "Modul 1", title: "Python asoslari — Test 1", passPercent: 60, active: true,
        questions: [
          { q: "Python'da o'zgaruvchi qanday e'lon qilinadi?", options: ["var x = 5", "x = 5", "int x = 5", "let x = 5"], correct: 1 },
          { q: "Ro'yxat (list) qaysi qavs bilan yoziladi?", options: ["()", "{}", "[]", "<>"], correct: 2 },
          { q: "print() nima qiladi?", options: ["O'chiradi", "Ekranga chiqaradi", "Saqlaydi", "Hisoblaydi"], correct: 1 },
          { q: "len() funksiyasi nimani qaytaradi?", options: ["Yig'indi", "Uzunlik", "Maksimum", "Tur"], correct: 1 },
          { q: "Izoh qaysi belgi bilan yoziladi?", options: ["//", "#", "/* */", "--"], correct: 1 }
        ] },
      { id: "tst_2", courseId: "t1", moduleRef: "Modul 2", title: "OOP va funksiyalar — Test 2", passPercent: 70, active: true,
        questions: [
          { q: "Funksiya qaysi kalit so'z bilan aniqlanadi?", options: ["func", "def", "function", "fn"], correct: 1 },
          { q: "Class'dan obyekt qanday yaratiladi?", options: ["new Class()", "Class()", "create Class", "Class.new"], correct: 1 },
          { q: "self nimani bildiradi?", options: ["Klass", "Obyektning o'zi", "Funksiya", "Modul"], correct: 1 }
        ] },
      { id: "tst_3", courseId: "t1", moduleRef: "Modul 3", title: "Yakuniy imtihon", passPercent: 70, active: true,
        questions: [
          { q: "Exception qanday ushlanadi?", options: ["try/except", "if/else", "for/in", "with/as"], correct: 0 },
          { q: "Modul qanday import qilinadi?", options: ["include x", "import x", "use x", "require x"], correct: 1 }
        ] },
      { id: "tst_5", courseId: "t2", moduleRef: "Modul 2", title: "Django ORM — Test 1", passPercent: 65, active: true,
        questions: [
          { q: "Model maydoni qaysi klassdan meros oladi?", options: ["models.Model", "django.View", "forms.Form", "http.Request"], correct: 0 },
          { q: "Migration buyrug'i?", options: ["makemigrations", "migrate-all", "syncdb-force", "db-push"], correct: 0 },
          { q: "filter() nima qaytaradi?", options: ["Bitta obyekt", "QuerySet", "JSON", "None"], correct: 1 }
        ] },
      { id: "tst_6", courseId: "t2", moduleRef: "Modul 3", title: "REST API — Yakuniy", passPercent: 70, active: false,
        questions: [
          { q: "DRF nima?", options: ["Django REST Framework", "Data Runtime File", "Docker Run Flag", "DB Row Format"], correct: 0 },
          { q: "GET so'rov nima uchun?", options: ["O'chirish", "O'qish", "Yozish", "Yangilash"], correct: 1 }
        ] },
      { id: "tst_4", courseId: "c4", moduleRef: "Modul 1", title: "Dizayn asoslari — Test", passPercent: 60, active: true,
        questions: [
          { q: "Figma nima uchun ishlatiladi?", options: ["Video montaj", "UI/UX dizayn", "Dasturlash", "Hisob-kitob"], correct: 1 },
          { q: "RGB nimaning qisqartmasi?", options: ["Red Green Blue", "Right Good Best", "Run Get Build", "Real Graphic Base"], correct: 0 }
        ] }
    ];
    var testResults = [
      { id: uid("res"), studentId: "u_std1", testId: "tst_1", score: 85, correct: 4, wrong: 1, percentage: 85, passed: true, date: "10 May 2026" },
      { id: uid("res"), studentId: "u_std1", testId: "tst_2", score: 72, correct: 2, wrong: 1, percentage: 72, passed: true, date: "18 May 2026" },
      { id: uid("res"), studentId: "u_std4", testId: "tst_1", score: 80, correct: 4, wrong: 1, percentage: 80, passed: true, date: "12 May 2026" },
      { id: uid("res"), studentId: "u_std4", testId: "tst_2", score: 68, correct: 2, wrong: 1, percentage: 68, passed: false, date: "20 May 2026" },
      { id: uid("res"), studentId: "u_std1", testId: "tst_5", score: 71, correct: 2, wrong: 1, percentage: 71, passed: true, date: "01 Iyun 2026" },
      { id: uid("res"), studentId: "u_std1", testId: "tst_4", score: 90, correct: 2, wrong: 0, percentage: 90, passed: true, date: "08 Iyun 2026" }
    ];
    // homework / topshiriqlar
    var assignments = [
      { id: "asg_1", courseId: "t1", teacherId: "u_tch1", title: "Mini loyiha: CRUD ilova", desc: "Oddiy CRUD ilova yozing" },
      { id: "asg_2", courseId: "t2", teacherId: "u_tch1", title: "REST API yaratish", desc: "DRF bilan 3 endpoint" }
    ];
    var assignmentSubs = [
      { id: uid("asub"), assignmentId: "asg_1", studentId: "u_std1", text: "GitHub link: github.com/aziz/crud", status: "graded", score: 92, date: "15 May 2026" },
      { id: uid("asub"), assignmentId: "asg_1", studentId: "u_std4", text: "Loyiha tayyor, PDF yuborildi", status: "graded", score: 88, date: "16 May 2026" },
      { id: uid("asub"), assignmentId: "asg_1", studentId: "u_std2", text: "Hali tugallanmagan versiya", status: "pending", score: 0, date: "18 May 2026" },
      { id: uid("asub"), assignmentId: "asg_1", studentId: "u_std5", text: "CRUD + validation qo'shdim", status: "pending", score: 0, date: "19 May 2026" },
      { id: uid("asub"), assignmentId: "asg_2", studentId: "u_std1", text: "3 ta endpoint ishlayapti", status: "graded", score: 90, date: "20 May 2026" },
      { id: uid("asub"), assignmentId: "asg_2", studentId: "u_std4", text: "Serializer xatosi bor", status: "pending", score: 0, date: "21 May 2026" },
      { id: uid("asub"), assignmentId: "asg_2", studentId: "u_std5", text: "JWT qo'shdim", status: "pending", score: 0, date: "22 May 2026" }
    ];

    var certificates = [
      { id: "PSK-2026-0418", studentId: "u_std1", courseId: "c4", date: "12 Iyun 2026", status: "valid" },
      { id: "PSK-2026-0402", studentId: "u_std4", courseId: "t1", date: "02 Iyun 2026", status: "valid" }
    ];

    var reviews = [
      { id: uid("rev"), studentId: "u_std1", courseId: "c4", rating: 5, text: "Ajoyib kurs! Figma'ni noldan o'rgandim va endi freelance qilyapman.", status: "visible", date: "12 Iyun 2026", reply: "" },
      { id: uid("rev"), studentId: "u_std4", courseId: "t1", rating: 5, text: "Eng yaxshi Python kursi! Ustoz juda tushunarli tushuntiradi.", status: "visible", date: "03 Iyun 2026", reply: "Rahmat, Nilufar! Omad!" },
      { id: uid("rev"), studentId: "u_std2", courseId: "c2", rating: 4, text: "Yaxshi kurs, lekin ba'zi darslar tezroq o'tilsa edi.", status: "visible", date: "20 May 2026", reply: "" }
    ];

    var questions = [
      { id: uid("q"), studentId: "u_std1", courseId: "t1", lessonRef: "3-modul, 2-dars", text: "List comprehension va generator o'rtasidagi farq nima?", time: "2 soat oldin", status: "answered", answer: "List comprehension darhol ro'yxat yaratadi, generator esa elementlarni talab bo'yicha qaytaradi va xotirani tejaydi.", teacherId: "u_tch1" },
      { id: uid("q"), studentId: "u_std1", courseId: "t1", lessonRef: "2-modul, 4-dars", text: "Dekoratorlarni qachon ishlatish kerak?", time: "Kecha", status: "unanswered", answer: "", teacherId: "u_tch1" },
      { id: uid("q"), studentId: "u_std5", courseId: "c5", lessonRef: "1-modul, 3-dars", text: "Target auditoriyani qanday aniqlayman?", time: "3 kun oldin", status: "answered", answer: "Mahsulot kim uchun foydali ekanini yozing, keyin yosh va qiziqish bo'yicha segmentlang.", teacherId: "u_tch4" }
    ];

    var notifications = [
      { id: uid("n"), userId: "u_std1", title: "Xush kelibsiz!", text: "ProSkill IT Academy'ga xush kelibsiz. O'qishni boshlang!", read: true, date: "02 May 2026" },
      { id: uid("n"), userId: "u_std1", title: "Sertifikat tayyor", text: "Grafik dizayn kursi sertifikatingiz tayyor.", read: false, date: "12 Iyun 2026" }
    ];

    var logs = [
      { id: uid("log"), who: "Super Admin", role: "superadmin", action: "Tizimni ishga tushirdi", target: "Platforma", time: timeLabel(), type: "settings" }
    ];

    var settings = {
      platformName: "ProSkill IT Academy",
      contactEmail: "info@proskill.uz",
      telegram: "@proskill_bot",
      registration: true,
      autoUnlock: true,
      emailNotif: true,
      telegramNotif: true,
      newPayments: false,
      maintenance: false
    };

    // Filial / bo'lim / guruh / xona (CRM)
    var branches = [
      { id: "br1", name: "Chilonzor filiali", address: "Toshkent, Chilonzor 9", phone: "+998 71 200 00 01", manager: "Jasur Toshmatov", active: true },
      { id: "br2", name: "Yunusobod filiali", address: "Toshkent, Yunusobod 12", phone: "+998 71 200 00 02", manager: "Kamola Saidova", active: true },
      { id: "br3", name: "Samarqand filiali", address: "Samarqand, Registon ko'chasi", phone: "+998 66 200 00 03", manager: "—", active: true }
    ];
    var groups = [
      { id: "gr1", branchId: "br1", name: "Python A1", courseId: "t1", teacherId: "u_tch1", room: "A-101", schedule: "Du/Chor/Ju 18:00", capacity: 18, students: 12, status: "active" },
      { id: "gr2", branchId: "br1", name: "Frontend B1", courseId: "c2", teacherId: "u_tch2", room: "A-102", schedule: "Se/Pay 17:00", capacity: 16, students: 14, status: "active" },
      { id: "gr3", branchId: "br2", name: "Backend Pro", courseId: "t2", teacherId: "u_tch1", room: "B-201", schedule: "Du/Ju 19:00", capacity: 14, students: 9, status: "active" },
      { id: "gr4", branchId: "br2", name: "SMM Start", courseId: "c5", teacherId: "u_tch4", room: "B-105", schedule: "Shanba 10:00", capacity: 20, students: 11, status: "active" },
      { id: "gr5", branchId: "br3", name: "Dizayn 01", courseId: "c4", teacherId: "u_tch4", room: "C-01", schedule: "Se/Pay 16:00", capacity: 12, students: 7, status: "draft" }
    ];
    var rooms = [
      { id: "rm1", branchId: "br1", name: "A-101", seats: 20, type: "Kompyuter" },
      { id: "rm2", branchId: "br1", name: "A-102", seats: 18, type: "Kompyuter" },
      { id: "rm3", branchId: "br2", name: "B-201", seats: 16, type: "Laboratoriya" },
      { id: "rm4", branchId: "br2", name: "B-105", seats: 22, type: "Seminar" },
      { id: "rm5", branchId: "br3", name: "C-01", seats: 14, type: "Dizayn" }
    ];
    // Leadlar (potensial mijozlar)
    var leads = [
      { id: "ld1", name: "Javlon Rahimov", phone: "+998 90 111 22 11", source: "Instagram", stage: "new", interest: "Python", note: "Bepul dars so'radi", managerId: "u_mgr1", lastContact: "22 Iyul 2026", createdAt: "20 Iyul 2026" },
      { id: "ld2", name: "Malika Yusupova", phone: "+998 91 333 44 22", source: "Sayt", stage: "contacted", interest: "Frontend", note: "Demo darsga keladi", managerId: "u_mgr1", lastContact: "21 Iyul 2026", createdAt: "18 Iyul 2026" },
      { id: "ld3", name: "Sardor Bekmurodov", phone: "+998 93 555 66 33", source: "Telegram", stage: "trial", interest: "Backend", note: "Trial darsda", managerId: "u_mgr2", lastContact: "23 Iyul 2026", createdAt: "15 Iyul 2026" },
      { id: "ld4", name: "Nilufar Karimova", phone: "+998 94 777 88 44", source: "Tavsiya", stage: "negotiation", interest: "SMM", note: "Narx so'radi", managerId: "u_mgr2", lastContact: "19 Iyul 2026", createdAt: "10 Iyul 2026" },
      { id: "ld5", name: "Akbar Toirov", phone: "+998 95 999 00 55", source: "Instagram", stage: "lost", interest: "Mobil", note: "Boshqa markazga ketdi", managerId: "u_mgr1", lastContact: "12 Iyul 2026", createdAt: "05 Iyul 2026" },
      { id: "ld6", name: "Dilnoza Alimova", phone: "+998 97 222 33 66", source: "Sayt", stage: "won", interest: "Python", note: "Ro'yxatdan o'tdi", managerId: "u_mgr1", lastContact: "16 Iyul 2026", createdAt: "01 Iyul 2026" }
    ];
    // Qarzdorlar
    var debts = [
      { id: "db1", studentId: "u_std2", courseId: "c2", amount: 450000, dueDate: "10 Iyul 2026", status: "overdue", note: "2-to'lov kechikdi", reminders: 1 },
      { id: "db2", studentId: "u_std4", courseId: "c4", amount: 295000, dueDate: "25 Iyul 2026", status: "due", note: "Yarim to'lov qoldi", reminders: 0 },
      { id: "db3", studentId: "u_std5", courseId: "c5", amount: 180000, dueDate: "01 Avgust 2026", status: "due", note: "Keyingi oy", reminders: 0 },
      { id: "db4", studentId: "u_std3", courseId: "t1", amount: 690000, dueDate: "05 Iyul 2026", status: "overdue", note: "To'liq to'lov kutilmoqda", reminders: 2 }
    ];
    // Vazifalar (boshqarish)
    var tasks = [
      { id: "tk1", title: "Leadlarni qayta chaqirish", assignee: "Jasur Toshmatov", due: "24 Iyul", priority: "high", status: "open", section: "leads" },
      { id: "tk2", title: "Qarzdorlarga eslatma", assignee: "Kamola Saidova", due: "23 Iyul", priority: "high", status: "open", section: "debts" },
      { id: "tk3", title: "Yangi guruh ochish — Python", assignee: "Sardor Aliyev", due: "30 Iyul", priority: "medium", status: "open", section: "groups" },
      { id: "tk4", title: "Hisobotni Super Admin'ga yuborish", assignee: "Jasur Toshmatov", due: "28 Iyul", priority: "low", status: "done", section: "reports" }
    ];
    // Xarajatlar (hisobot)
    var expenses = [
      { id: "ex1", title: "Ijara — Chilonzor", amount: 12000000, category: "Ijara", date: "01 Iyul 2026", branchId: "br1" },
      { id: "ex2", title: "Ustozlar maoshi", amount: 28000000, category: "Maosh", date: "05 Iyul 2026", branchId: "br1" },
      { id: "ex3", title: "Marketing (Instagram)", amount: 3500000, category: "Marketing", date: "10 Iyul 2026", branchId: null },
      { id: "ex4", title: "Kommunal", amount: 1800000, category: "Kommunal", date: "12 Iyul 2026", branchId: "br2" }
    ];

    // Xodim maosh / grafik (teachers + managers)
    users.forEach(function (u) {
      if (u.role === "teacher") {
        if (u.salary == null) u.salary = (u.payoutRate || 40) * 150000;
        if (!u.schedule) u.schedule = "Du–Ju 14:00–20:00";
        if (!u.position) u.position = "O'qituvchi";
      }
      if (u.role === "manager") {
        if (u.salary == null) u.salary = 8000000;
        if (!u.schedule) u.schedule = "Du–Shan 09:00–18:00";
        if (!u.position) u.position = "Manager";
      }
    });

    return {
      users: users, categories: categories, courses: courses, modules: modules, lessons: lessons,
      enrollments: enrollments, progress: progress, payments: payments, tests: tests, testResults: testResults,
      assignments: assignments, assignmentSubs: assignmentSubs,
      certificates: certificates, reviews: reviews, questions: questions, comments: [],
      notifications: notifications, logs: logs, settings: settings,
      branches: branches, groups: groups, rooms: rooms, leads: leads, debts: debts, tasks: tasks, expenses: expenses
    };
  }

  // ---------- LOAD / SAVE ----------
  var data;
  function load() {
    try {
      var r = localStorage.getItem(DB_KEY);
      if (r) {
        var d = JSON.parse(r);
        return ensureCrmTables(d);
      }
    } catch (e) {}
    var s = seed();
    try { localStorage.setItem(DB_KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }
  function ensureCrmTables(d) {
    if (!d) return d;
    if (!d.comments) d.comments = [];
    if (!d.assignments) d.assignments = [];
    if (!d.assignmentSubs) d.assignmentSubs = [];
    if (!d.tests) d.tests = [];
    if (!d.testResults) d.testResults = [];
    if (!d.courses) d.courses = [];
    if (!d.modules) d.modules = [];
    if (!d.lessons) d.lessons = [];
    if (!d.enrollments) d.enrollments = [];
    if (!d.users) d.users = [];
    if (!d.branches || !d.branches.length) {
      d.branches = [
        { id: "br1", name: "Chilonzor filiali", address: "Toshkent, Chilonzor 9", phone: "+998 71 200 00 01", manager: "Jasur Toshmatov", active: true },
        { id: "br2", name: "Yunusobod filiali", address: "Toshkent, Yunusobod 12", phone: "+998 71 200 00 02", manager: "Kamola Saidova", active: true }
      ];
    }
    if (!d.groups) d.groups = [];
    if (!d.rooms) d.rooms = [];
    if (!d.leads) d.leads = [];
    if (!d.debts) d.debts = [];
    if (!d.tasks) d.tasks = [];
    if (!d.expenses) d.expenses = [];
    // bir marta demo CRM to'ldirish (bo'sh bo'lsa)
    if (!d._crmSeeded) {
      if (!d.leads.length) {
        d.leads = [
          { id: "ld1", name: "Javlon Rahimov", phone: "+998 90 111 22 11", source: "Instagram", stage: "new", interest: "Python", note: "Bepul dars so'radi", managerId: "u_mgr1", lastContact: todayLabel(), createdAt: todayLabel() },
          { id: "ld2", name: "Malika Yusupova", phone: "+998 91 333 44 22", source: "Sayt", stage: "contacted", interest: "Frontend", note: "Demo darsga keladi", managerId: "u_mgr1", lastContact: todayLabel(), createdAt: todayLabel() },
          { id: "ld3", name: "Sardor Bekmurodov", phone: "+998 93 555 66 33", source: "Telegram", stage: "trial", interest: "Backend", note: "Trial darsda", managerId: "u_mgr2", lastContact: todayLabel(), createdAt: todayLabel() }
        ];
      }
      if (!d.groups.length) {
        d.groups = [
          { id: "gr1", branchId: "br1", name: "Python A1", courseId: "t1", teacherId: "u_tch1", room: "A-101", schedule: "Du/Chor/Ju 18:00", capacity: 18, students: 12, status: "active" },
          { id: "gr2", branchId: "br1", name: "Frontend B1", courseId: "c2", teacherId: "u_tch2", room: "A-102", schedule: "Se/Pay 17:00", capacity: 16, students: 14, status: "active" }
        ];
      }
      if (!d.debts.length) {
        d.debts = [
          { id: "db1", studentId: "u_std2", courseId: "c2", amount: 450000, dueDate: todayLabel(), status: "overdue", note: "2-to'lov kechikdi", reminders: 1 },
          { id: "db2", studentId: "u_std4", courseId: "c4", amount: 295000, dueDate: todayLabel(), status: "due", note: "Yarim to'lov qoldi", reminders: 0 }
        ];
      }
      if (!d.tasks.length) {
        d.tasks = [
          { id: "tk1", title: "Leadlarni qayta chaqirish", assignee: "Manager", due: todayLabel(), priority: "high", status: "open", section: "leads" },
          { id: "tk2", title: "Qarzdorlarga eslatma", assignee: "Manager", due: todayLabel(), priority: "high", status: "open", section: "debts" }
        ];
      }
      if (!d.expenses.length) {
        d.expenses = [
          { id: "ex1", title: "Ijara", amount: 12000000, category: "Ijara", date: todayLabel(), branchId: "br1" },
          { id: "ex2", title: "Marketing", amount: 3500000, category: "Marketing", date: todayLabel(), branchId: null }
        ];
      }
      if (!d.rooms.length) {
        d.rooms = [
          { id: "rm1", branchId: "br1", name: "A-101", seats: 20, type: "Kompyuter" },
          { id: "rm2", branchId: "br2", name: "B-201", seats: 16, type: "Laboratoriya" }
        ];
      }
      d._crmSeeded = true;
    }
    return d;
  }
  function save() { try { localStorage.setItem(DB_KEY, JSON.stringify(data)); } catch (e) {} }
  data = ensureCrmTables(load());
  try { save(); } catch (e) {}
  function reset() { data = seed(); save(); try { localStorage.removeItem(SESSION_KEY); } catch (e) {} }
  /** Boshqa tab (ustoz/manager) yozgan o'zgarishlarni xotiraga qayta yuklash */
  function reloadFromStorage() {
    try {
      var r = localStorage.getItem(DB_KEY);
      if (!r) return false;
      var d = JSON.parse(r);
      if (!d || typeof d !== "object") return false;
      data = ensureCrmTables(d);
      return true;
    } catch (e) { return false; }
  }

  // ---------- SESSION / AUTH ----------
  function session() { try { var r = localStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function setSession(s) { try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {} }
  function logout() { try { localStorage.removeItem(SESSION_KEY); } catch (e) {} }
  function currentUser() { var s = session(); return s ? byId("users", s.userId) : null; }

  function login(email, password) {
    var u = data.users.filter(function (x) { return x.email.toLowerCase() === (email || "").toLowerCase(); })[0];
    if (!u) return { ok: false, error: "Foydalanuvchi topilmadi" };
    if (u.password !== password) return { ok: false, error: "Parol noto'g'ri" };
    if (u.status === "blocked") return { ok: false, error: "Hisobingiz bloklangan" };
    u.last = "Hozir"; save();
    setSession({ userId: u.id, role: u.role });
    log(u.name, u.role, "Tizimga kirdi", u.email, "auth");
    return { ok: true, user: u };
  }
  function loginAs(role) {
    var u = data.users.filter(function (x) { return x.role === role && x.status === "active"; })[0];
    if (!u) return { ok: false };
    u.last = "Hozir"; save();
    setSession({ userId: u.id, role: u.role });
    log(u.name, u.role, "Tizimga kirdi", u.email, "auth");
    return { ok: true, user: u };
  }
  function register(name, email, password) {
    if (data.users.some(function (x) { return x.email.toLowerCase() === (email || "").toLowerCase(); }))
      return { ok: false, error: "Bu email allaqachon ro'yxatdan o'tgan" };
    var u = { id: uid("u"), name: name || "Yangi o'quvchi", email: email, password: password || "1234", role: "student", status: "active", joined: todayLabel(), last: "Hozir" };
    data.users.push(u); save();
    setSession({ userId: u.id, role: u.role });
    log(u.name, "student", "Ro'yxatdan o'tdi", u.email, "auth");
    return { ok: true, user: u };
  }

  // ---------- GENERIC ----------
  function table(t) { return data[t] || []; }
  function byId(t, id) { return (data[t] || []).filter(function (x) { return x.id === id; })[0] || null; }
  function insert(t, row) { if (!row.id) row.id = uid(t); data[t].push(row); save(); return row; }
  function update(t, id, patch) { var r = byId(t, id); if (r) { Object.keys(patch).forEach(function (k) { r[k] = patch[k]; }); save(); } return r; }
  function remove(t, id) { data[t] = data[t].filter(function (x) { return x.id !== id; }); save(); }

  // ---------- HELPERS ----------
  function userName(id) { var u = byId("users", id); return u ? u.name : "—"; }
  function userAvatar(id) { var u = byId("users", id); return (u && u.avatar) ? u.avatar : ""; }
  function courseTitle(id) { var c = byId("courses", id); return c ? c.title : "—"; }
  function updateProfile(id, patch, byUser) {
    var u = byId("users", id);
    if (!u) return { ok: false, error: "Foydalanuvchi topilmadi" };
    var allowed = { name: 1, bio: 1, spec: 1, phone: 1, avatar: 1, telegram: 1, experience: 1, certificates: 1, payoutRate: 1 };
    var clean = {};
    Object.keys(patch || {}).forEach(function (k) {
      if (!allowed[k]) return;
      var v = patch[k];
      if (k === "avatar") {
        clean[k] = v ? String(v) : "";
      } else {
        clean[k] = v == null ? "" : String(v);
      }
    });
    update("users", id, clean);
    log(byUser || u.name, u.role || "user", "Profilni yangiladi", u.name, "content");
    return { ok: true, user: byId("users", id) };
  }
  function lessonsOf(courseId) { return data.lessons.filter(function (l) { return l.courseId === courseId; }); }
  function modulesOf(courseId) { return data.modules.filter(function (m) { return m.courseId === courseId; }).sort(function (a, b) { return a.order - b.order; }); }

  function isEnrolled(studentId, courseId) { return data.enrollments.some(function (e) { return e.studentId === studentId && e.courseId === courseId; }); }
  function enrollmentsOf(studentId) { return data.enrollments.filter(function (e) { return e.studentId === studentId; }); }
  function isDone(studentId, lessonId) { return data.progress.some(function (p) { return p.studentId === studentId && p.lessonId === lessonId; }); }
  function progressFor(studentId, courseId) {
    var ls = lessonsOf(courseId); if (!ls.length) return 0;
    var done = ls.filter(function (l) { return isDone(studentId, l.id); }).length;
    return Math.round(done / ls.length * 100);
  }
  function progressCount(studentId, courseId) {
    var ls = lessonsOf(courseId);
    var done = ls.filter(function (l) { return isDone(studentId, l.id); }).length;
    return { done: done, total: ls.length };
  }

  // ---------- DOMAIN OPS ----------
  function enrollFree(studentId, courseId) {
    if (isEnrolled(studentId, courseId)) return { ok: false, error: "Allaqachon yozilgansiz" };
    insert("enrollments", { studentId: studentId, courseId: courseId, type: "free", status: "active", createdAt: todayLabel() });
    notify(studentId, "Kurs ochildi", '"' + courseTitle(courseId) + '" kursiga bepul yozildingiz.');
    log(userName(studentId), "student", "Bepul kursga yozildi", courseTitle(courseId), "enroll");
    return { ok: true };
  }
  function requestPayment(studentId, courseId, method) {
    if (isEnrolled(studentId, courseId)) return { ok: false, error: "Allaqachon yozilgansiz" };
    var c = byId("courses", courseId);
    var p = insert("payments", { id: "#" + (10300 + data.payments.length), studentId: studentId, courseId: courseId, amount: c ? c.price : 0, method: method || "Payme", status: "pending", date: todayLabel(), reason: "" });
    log(userName(studentId), "student", "To'lov yubordi", courseTitle(courseId), "payment");
    return { ok: true, payment: p };
  }
  function findPayment(paymentId) {
    var id = paymentId == null ? "" : String(paymentId);
    return data.payments.filter(function (x) { return String(x.id) === id; })[0] || null;
  }
  function approvePayment(paymentId, byUser) {
    var p = findPayment(paymentId) || byId("payments", paymentId);
    if (!p) return { ok: false, error: "To'lov topilmadi" };
    if (p.status === "paid") return { ok: true, payment: p, already: true };
    p.status = "paid";
    p.reason = "";
    if (!isEnrolled(p.studentId, p.courseId))
      insert("enrollments", { studentId: p.studentId, courseId: p.courseId, type: "paid", status: "active", createdAt: todayLabel() });
    save();
    notify(p.studentId, "To'lov tasdiqlandi", '"' + courseTitle(p.courseId) + '" kursi ochildi. O\'qishni boshlang!');
    log(byUser || "Manager", "manager", "To'lovni tasdiqladi", p.id + " · " + courseTitle(p.courseId), "payment");
    return { ok: true, payment: p };
  }
  function rejectPayment(paymentId, reason, byUser) {
    var p = findPayment(paymentId) || byId("payments", paymentId);
    if (!p) return { ok: false, error: "To'lov topilmadi" };
    p.status = "failed";
    p.reason = reason || "To'lov rad etildi";
    save();
    notify(p.studentId, "To'lov rad etildi", '"' + courseTitle(p.courseId) + '" uchun to\'lov rad etildi: ' + p.reason);
    log(byUser || "Manager", "manager", "To'lovni rad qildi", p.id, "payment");
    return { ok: true, payment: p };
  }
  function manualEnroll(studentEmailOrName, courseTitleOrId, byUser) {
    var key = String(studentEmailOrName || "").trim().toLowerCase();
    var ckey = String(courseTitleOrId || "").trim();
    var u = data.users.filter(function (x) {
      return (x.email && x.email.toLowerCase() === key) ||
        (x.name && x.name.toLowerCase() === key) ||
        (x.id && x.id === studentEmailOrName);
    })[0];
    var c = data.courses.filter(function (x) {
      return x.id === ckey ||
        (x.title && x.title.toLowerCase() === ckey.toLowerCase()) ||
        (x.title && x.title.toLowerCase().indexOf(ckey.toLowerCase()) >= 0);
    })[0];
    if (!u) return { ok: false, error: "Student topilmadi — ro'yxatdan tanlang" };
    if (!c) return { ok: false, error: "Kurs topilmadi — ro'yxatdan tanlang" };
    if (isEnrolled(u.id, c.id)) return { ok: false, error: "Bu student allaqachon shu kursga yozilgan" };
    insert("enrollments", { studentId: u.id, courseId: c.id, type: "paid", status: "active", createdAt: todayLabel() });
    // tarix uchun paid to'lov yozuvi
    insert("payments", {
      id: "#M" + (10000 + data.payments.length),
      studentId: u.id,
      courseId: c.id,
      amount: c.price || 0,
      method: "Naqd",
      status: "paid",
      date: todayLabel(),
      reason: "Manual enroll"
    });
    notify(u.id, "Kurs ochildi", '"' + c.title + '" kursi qo\'lda ochildi.');
    log(byUser || "Manager", "manager", "Qo'lda kursga yozdi", u.name + " → " + c.title, "enroll");
    return { ok: true, student: u, course: c };
  }
  function completeLesson(studentId, lessonId) {
    if (!isDone(studentId, lessonId)) { data.progress.push({ studentId: studentId, lessonId: lessonId }); save(); }
    return { ok: true };
  }
  function submitTest(studentId, testId, answers) {
    var t = byId("tests", testId); if (!t) return { ok: false };
    var correct = 0;
    t.questions.forEach(function (q, i) { if (answers && answers[i] === q.correct) correct++; });
    var total = t.questions.length;
    var pct = Math.round(correct / total * 100);
    var passed = pct >= t.passPercent;
    var prev = data.testResults.filter(function (r) { return r.studentId === studentId && r.testId === testId; })[0];
    var res = { studentId: studentId, testId: testId, score: pct, correct: correct, wrong: total - correct, percentage: pct, passed: passed, date: todayLabel() };
    if (prev) { Object.keys(res).forEach(function (k) { prev[k] = res[k]; }); } else { insert("testResults", res); }
    save();
    log(userName(studentId), "student", "Test ishladi", t.title + " (" + pct + "%)", "test");
    return { ok: true, result: res };
  }
  function testResultFor(studentId, testId) { return data.testResults.filter(function (r) { return r.studentId === studentId && r.testId === testId; })[0] || null; }
  function testsOfCourse(courseId) { return data.tests.filter(function (t) { return t.courseId === courseId; }); }
  function testsOfTeacher(teacherId) {
    var ids = {};
    data.courses.filter(function (c) { return c.teacherId === teacherId; }).forEach(function (c) { ids[c.id] = 1; });
    return data.tests.filter(function (t) { return ids[t.courseId]; });
  }
  function addTest(row, byUser) {
    if (!row || !row.courseId) return { ok: false, error: "Kurs tanlanmagan" };
    if (!row.title || !String(row.title).trim()) return { ok: false, error: "Test nomi majburiy" };
    var qs = row.questions;
    if (!qs || !qs.length) {
      qs = [
        { q: "Namuna savol 1?", options: ["A", "B", "C", "D"], correct: 0 },
        { q: "Namuna savol 2?", options: ["A", "B", "C", "D"], correct: 1 }
      ];
    }
    var t = insert("tests", {
      courseId: row.courseId,
      moduleRef: row.moduleRef || "Modul 1",
      title: String(row.title).trim(),
      passPercent: Number(row.passPercent) || 60,
      active: row.active !== false,
      questions: qs
    });
    log(byUser || "Teacher", "teacher", "Yangi test yaratdi", t.title, "content");
    return { ok: true, test: t };
  }
  function updateTest(id, patch, byUser) {
    var t = byId("tests", id);
    if (!t) return { ok: false, error: "Test topilmadi" };
    var allowed = ["title", "moduleRef", "passPercent", "active", "questions", "courseId"];
    var p = {};
    allowed.forEach(function (k) { if (patch && patch[k] !== undefined) p[k] = patch[k]; });
    if (p.passPercent !== undefined) p.passPercent = Number(p.passPercent) || 60;
    update("tests", id, p);
    log(byUser || "Teacher", "teacher", "Testni tahrirladi", t.title, "content");
    return { ok: true, test: byId("tests", id) };
  }
  function toggleTestActive(id, byUser) {
    var t = byId("tests", id);
    if (!t) return { ok: false, error: "Test topilmadi" };
    t.active = !t.active; save();
    log(byUser || "Teacher", "teacher", t.active ? "Testni faollashtirdi" : "Testni o'chirdi", t.title, "content");
    return { ok: true, test: t };
  }
  function testStats(testId) {
    var res = data.testResults.filter(function (r) { return r.testId === testId; });
    if (!res.length) return { attempts: 0, avg: 0 };
    var avg = Math.round(res.reduce(function (s, r) { return s + (r.percentage || r.score || 0); }, 0) / res.length);
    return { attempts: res.length, avg: avg };
  }
  function resultsOfTest(testId) {
    return data.testResults.filter(function (r) { return r.testId === testId; }).slice().reverse();
  }
  function assignmentsOfTeacher(teacherId) {
    return (data.assignments || []).filter(function (a) { return a.teacherId === teacherId; });
  }
  function assignmentStats(assignmentId) {
    var subs = (data.assignmentSubs || []).filter(function (s) { return s.assignmentId === assignmentId; });
    var graded = subs.filter(function (s) { return s.status === "graded"; }).length;
    var pending = subs.filter(function (s) { return s.status === "pending"; }).length;
    return { submitted: subs.length, graded: graded, pending: pending, subs: subs };
  }
  function addAssignment(row, byUser) {
    if (!row || !row.courseId || !row.title) return { ok: false, error: "Kurs va nom majburiy" };
    var c = byId("courses", row.courseId);
    var a = insert("assignments", {
      courseId: row.courseId,
      teacherId: row.teacherId || (c ? c.teacherId : null),
      title: String(row.title).trim(),
      desc: row.desc || ""
    });
    log(byUser || "Teacher", "teacher", "Topshiriq yaratdi", a.title, "content");
    return { ok: true, assignment: a };
  }
  function gradeAssignmentSub(subId, score, byUser) {
    var s = byId("assignmentSubs", subId);
    if (!s) return { ok: false, error: "Topshiriq topilmadi" };
    s.status = "graded";
    s.score = Number(score) || 0;
    save();
    notify(s.studentId, "Topshiriq baholandi", "Sizning topshirig'ingiz baholandi: " + s.score + " ball");
    log(byUser || "Teacher", "teacher", "Topshiriqni baholadi", userName(s.studentId) + " · " + s.score, "content");
    return { ok: true, sub: s };
  }
  function gradeAllPending(assignmentId, defaultScore, byUser) {
    var score = Number(defaultScore);
    if (!(score >= 0)) score = 80;
    var list = (data.assignmentSubs || []).filter(function (s) { return s.assignmentId === assignmentId && s.status === "pending"; });
    list.forEach(function (s) {
      s.status = "graded";
      s.score = score;
      notify(s.studentId, "Topshiriq baholandi", "Sizning topshirig'ingiz baholandi: " + score + " ball");
    });
    save();
    log(byUser || "Teacher", "teacher", "Topshiriqlarni baholadi", list.length + " ta · " + score + " ball", "content");
    return { ok: true, count: list.length };
  }
  function issueCertificate(studentId, courseId) {
    if (progressFor(studentId, courseId) < 100) return { ok: false, error: "Kurs hali 100% tugatilmagan" };
    var existing = data.certificates.filter(function (c) { return c.studentId === studentId && c.courseId === courseId; })[0];
    if (existing) return { ok: true, cert: existing };
    var c = insert("certificates", { id: "PSK-" + new Date().getFullYear() + "-" + (1000 + data.certificates.length), studentId: studentId, courseId: courseId, date: todayLabel(), status: "valid" });
    notify(studentId, "Sertifikat tayyor", '"' + courseTitle(courseId) + '" kursi sertifikati tayyor!');
    log(userName(studentId), "student", "Sertifikat oldi", courseTitle(courseId), "content");
    return { ok: true, cert: c };
  }
  function addReview(studentId, courseId, rating, text) {
    insert("reviews", { studentId: studentId, courseId: courseId, rating: rating, text: text, status: "visible", date: todayLabel(), reply: "" });
    log(userName(studentId), "student", "Fikr qoldirdi", courseTitle(courseId), "content");
    return { ok: true };
  }
  function addLessonComment(studentId, courseId, lessonId, text, rating) {
    var body = text ? String(text).trim() : "";
    if (!body) return { ok: false, error: "Izoh yozing" };
    if (!lessonId) return { ok: false, error: "Dars tanlanmagan" };
    if (!data.comments) data.comments = [];
    var row = insert("comments", {
      studentId: studentId,
      courseId: courseId || null,
      lessonId: lessonId,
      text: body,
      rating: rating ? Math.max(1, Math.min(5, parseInt(rating, 10) || 5)) : 5,
      date: todayLabel(),
      time: timeLabel()
    });
    log(userName(studentId), "student", "Darsga izoh yozdi", courseTitle(courseId) || lessonId, "content");
    return { ok: true, comment: row };
  }
  function commentsOfLesson(lessonId) {
    if (!data.comments) return [];
    return data.comments.filter(function (c) { return c.lessonId === lessonId; }).slice().reverse();
  }
  function askQuestion(studentId, courseId, lessonRef, text) {
    var c = byId("courses", courseId);
    insert("questions", { studentId: studentId, courseId: courseId, lessonRef: lessonRef || "", text: text, time: "Hozir", status: "unanswered", answer: "", teacherId: c ? c.teacherId : null });
    log(userName(studentId), "student", "Savol berdi", courseTitle(courseId), "content");
    return { ok: true };
  }
  function answerQuestion(qId, answer) { var q = byId("questions", qId); if (q) { q.answer = answer; q.status = "answered"; save(); } return { ok: true }; }

  function notify(userId, title, text) { insert("notifications", { userId: userId, title: title, text: text, read: false, date: todayLabel() }); }
  function notificationsOf(userId) { return data.notifications.filter(function (n) { return n.userId === userId; }).slice().reverse(); }
  function markNotifRead(id) { var n = byId("notifications", id); if (n) { n.read = true; save(); } }
  function log(who, role, action, target, type) { data.logs.unshift({ id: uid("log"), who: who, role: role, action: action, target: target, time: timeLabel(), type: type || "content" }); if (data.logs.length > 200) data.logs.pop(); save(); }

  // user management
  function setUserStatus(id, status, byUser) {
    var u = byId("users", id); if (!u) return { ok: false };
    if (u.role === "superadmin") return { ok: false, error: "Super Admin'ga tegib bo'lmaydi (403)" };
    u.status = status; save();
    log(byUser || "Admin", "superadmin", status === "blocked" ? "Foydalanuvchini blokladi" : "Foydalanuvchini faollashtirdi", u.name, "security");
    return { ok: true };
  }
  function setUserRole(id, role, byUser) {
    var u = byId("users", id); if (!u) return { ok: false };
    if (u.role === "superadmin") return { ok: false, error: "Super Admin rolini o'zgartirib bo'lmaydi (403)" };
    u.role = role; save();
    log(byUser || "Admin", "superadmin", "Rolni o'zgartirdi", u.name + " → " + role, "security");
    return { ok: true };
  }
  function deleteUser(id, byUser) {
    var u = byId("users", id); if (!u) return { ok: false };
    if (u.role === "superadmin") return { ok: false, error: "Super Admin'ni o'chirib bo'lmaydi (403)" };
    remove("users", id);
    log(byUser || "Admin", "superadmin", "Foydalanuvchini o'chirdi", u.name, "security");
    return { ok: true };
  }
  function addTeacher(row, byUser) {
    if (!row || !row.name || !String(row.name).trim()) return { ok: false, error: "Ism majburiy" };
    var email = (row.email || "").trim().toLowerCase();
    if (!email) return { ok: false, error: "Email majburiy" };
    if (data.users.some(function (x) { return (x.email || "").toLowerCase() === email; }))
      return { ok: false, error: "Bu email band" };
    var u = insert("users", {
      name: String(row.name).trim(),
      email: email,
      password: row.password || "teacher",
      role: "teacher",
      status: "active",
      joined: todayLabel(),
      last: "Hozir",
      bio: row.bio || "",
      spec: row.spec || "",
      phone: row.phone || "",
      experience: row.experience || "",
      certificates: row.certificates || "",
      avatar: row.avatar || "",
      payoutRate: Number(row.payoutRate) >= 0 ? Number(row.payoutRate) : 40
    });
    log(byUser || "Manager", "manager", "Yangi ustoz qo'shdi", u.name, "security");
    return { ok: true, user: u };
  }
  function updateTeacher(id, patch, byUser) {
    var u = byId("users", id);
    if (!u || u.role !== "teacher") return { ok: false, error: "Ustoz topilmadi" };
    var allowed = ["name", "email", "bio", "spec", "phone", "experience", "certificates", "avatar", "payoutRate", "status", "password"];
    var p = {};
    allowed.forEach(function (k) {
      if (patch && patch[k] !== undefined) p[k] = patch[k];
    });
    if (p.email) {
      var em = String(p.email).toLowerCase();
      if (data.users.some(function (x) { return x.id !== id && (x.email || "").toLowerCase() === em; }))
        return { ok: false, error: "Email band" };
      p.email = em;
    }
    if (p.payoutRate !== undefined) p.payoutRate = Number(p.payoutRate) || 0;
    update("users", id, p);
    log(byUser || "Manager", "manager", "Ustozni tahrirladi", u.name, "content");
    return { ok: true, user: byId("users", id) };
  }
  function assignCourseTeacher(courseId, teacherId, byUser) {
    var c = byId("courses", courseId);
    var t = byId("users", teacherId);
    if (!c) return { ok: false, error: "Kurs topilmadi" };
    if (!t || t.role !== "teacher") return { ok: false, error: "Ustoz topilmadi" };
    update("courses", courseId, { teacherId: teacherId });
    log(byUser || "Manager", "manager", "Kursni ustozga biriktirdi", c.title + " → " + t.name, "content");
    return { ok: true, course: byId("courses", courseId) };
  }
  function teacherReviews(teacherId) {
    var courseIds = data.courses.filter(function (c) { return c.teacherId === teacherId; }).map(function (c) { return c.id; });
    return (data.reviews || []).filter(function (r) { return courseIds.indexOf(r.courseId) >= 0; }).slice().reverse();
  }
  function teacherRating(teacherId) {
    var revs = teacherReviews(teacherId);
    if (!revs.length) {
      var pubs = data.courses.filter(function (c) { return c.teacherId === teacherId && c.status === "published" && (c.rating || 0) > 0; });
      if (!pubs.length) return 0;
      return Math.round((pubs.reduce(function (s, c) { return s + (c.rating || 0); }, 0) / pubs.length) * 10) / 10;
    }
    return Math.round((revs.reduce(function (s, r) { return s + (r.rating || 0); }, 0) / revs.length) * 10) / 10;
  }
  function teacherPayouts() {
    return data.users.filter(function (u) { return u.role === "teacher"; }).map(function (t) {
      var courseIds = data.courses.filter(function (c) { return c.teacherId === t.id; }).map(function (c) { return c.id; });
      var revenue = data.payments.filter(function (p) {
        return p.status === "paid" && courseIds.indexOf(p.courseId) >= 0;
      }).reduce(function (s, p) { return s + (p.amount || 0); }, 0);
      var rate = (t.payoutRate !== undefined && t.payoutRate !== null) ? Number(t.payoutRate) : 40;
      var payout = Math.round(revenue * rate / 100);
      return {
        teacherId: t.id,
        name: t.name,
        rate: rate,
        revenue: revenue,
        payout: payout,
        courses: courseIds.length,
        rating: teacherRating(t.id)
      };
    }).sort(function (a, b) { return b.payout - a.payout; });
  }
  // course management
  function setCourseStatus(id, status, byUser, role) {
    var c = byId("courses", id); if (!c) return { ok: false };
    var prev = c.status;
    c.status = status; save();
    log(byUser || "Admin", role || "superadmin", "Kurs holatini o'zgartirdi", c.title + " → " + status, "content");
    // Publish bo'lganda yozilgan o'quvchilarga xabar
    if (status === "published" && prev !== "published") {
      (data.enrollments || []).filter(function (e) { return e.courseId === id; }).forEach(function (e) {
        notify(e.studentId, "Kurs ochildi", '"' + c.title + '" kursi o\'quvchilar uchun ochildi. Darslarni ko\'ring!');
      });
    }
    return { ok: true };
  }
  function toggleFeatured(id) { var c = byId("courses", id); if (c) { c.featured = !c.featured; save(); } return { ok: true }; }
  function addCourse(row, byUser, role) {
    if (!row || !row.title) return { ok: false, error: "Kurs nomi majburiy" };
    var c = insert("courses", Object.assign({
      rating: 0, status: "draft", featured: false, level: "Boshlang'ich",
      price: 0, desc: "", comment: "", cat: "Python", duration: "", teacherId: null
    }, row));
    log(byUser || "Teacher", role || "teacher", "Yangi kurs yaratdi", c.title + " (draft)", "content");
    return { ok: true, course: c };
  }
  function updateCourse(id, patch, byUser, role) {
    var c = byId("courses", id);
    if (!c) return { ok: false, error: "Kurs topilmadi" };
    var allowed = ["title", "desc", "price", "cat", "level", "status", "teacherId", "duration", "featured", "comment"];
    var p = {};
    allowed.forEach(function (k) {
      if (patch && patch[k] !== undefined) p[k] = patch[k];
    });
    if (p.price !== undefined) p.price = Number(p.price) || 0;
    update("courses", id, p);
    log(byUser || "Manager", role || "manager", "Kursni tahrirladi", c.title, "content");
    return { ok: true, course: byId("courses", id) };
  }
  function addLesson(moduleId, courseId, row, byUser, role) {
    if (!moduleId || !courseId) return { ok: false, error: "Modul yoki kurs tanlanmagan" };
    var title = (row && row.title) ? String(row.title).trim() : "";
    if (!title) return { ok: false, error: "Dars nomi majburiy" };
    var existing = data.lessons.filter(function (l) { return l.moduleId === moduleId; });
    var l = insert("lessons", {
      moduleId: moduleId,
      courseId: courseId,
      title: title,
      duration: (row && row.duration) || "10:00",
      free: !!(row && row.free),
      videoUrl: (row && row.videoUrl) || "",
      order: existing.length
    });
    log(byUser || "Teacher", role || "teacher", "Yangi dars qo'shdi", courseTitle(courseId) + " → " + l.title, "content");
    return { ok: true, lesson: l };
  }
  function updateLesson(id, patch, byUser, role) {
    var l = byId("lessons", id);
    if (!l) return { ok: false, error: "Dars topilmadi" };
    update("lessons", id, patch || {});
    log(byUser || "Teacher", role || "teacher", "Darsni tahrirladi", (patch && patch.title) || l.title, "content");
    return { ok: true, lesson: byId("lessons", id) };
  }
  function deleteLesson(id, byUser, role) {
    var l = byId("lessons", id);
    if (!l) return { ok: false, error: "Dars topilmadi" };
    var title = l.title;
    data.progress = (data.progress || []).filter(function (p) { return p.lessonId !== id; });
    remove("lessons", id);
    // re-order within module
    data.lessons.filter(function (x) { return x.moduleId === l.moduleId; })
      .sort(function (a, b) { return (a.order || 0) - (b.order || 0); })
      .forEach(function (x, i) { x.order = i; });
    save();
    log(byUser || "Teacher", role || "teacher", "Darsni o'chirdi", title, "content");
    return { ok: true };
  }

  function addModule(courseId, title, byUser, role) {
    if (!courseId) return { ok: false, error: "Kurs tanlanmagan" };
    if (!title || !String(title).trim()) return { ok: false, error: "Modul nomi majburiy" };
    var mods = modulesOf(courseId);
    var m = insert("modules", {
      courseId: courseId,
      title: String(title).trim(),
      order: mods.length
    });
    log(byUser || "Teacher", role || "teacher", "Yangi modul qo'shdi", courseTitle(courseId) + " → " + m.title, "content");
    return { ok: true, module: m };
  }
  function updateModule(id, patch, byUser, role) {
    var m = byId("modules", id);
    if (!m) return { ok: false, error: "Modul topilmadi" };
    update("modules", id, patch || {});
    log(byUser || "Teacher", role || "teacher", "Modulni tahrirladi", (patch && patch.title) || m.title, "content");
    return { ok: true, module: byId("modules", id) };
  }
  function deleteModule(id, byUser, role) {
    var m = byId("modules", id);
    if (!m) return { ok: false, error: "Modul topilmadi" };
    var title = m.title;
    var courseId = m.courseId;
    data.lessons = data.lessons.filter(function (l) { return l.moduleId !== id; });
    data.progress = (data.progress || []).filter(function (p) {
      return data.lessons.some(function (l) { return l.id === p.lessonId; });
    });
    remove("modules", id);
    // re-order remaining
    modulesOf(courseId).forEach(function (mod, i) { mod.order = i; });
    save();
    log(byUser || "Teacher", role || "teacher", "Modulni o'chirdi", courseTitle(courseId) + " → " + title, "content");
    return { ok: true };
  }

  function deleteCourse(id, byUser, role) {
    var c = byId("courses", id);
    if (!c) return { ok: false, error: "Kurs topilmadi" };
    var title = c.title;
    // bog'liq ma'lumotlarni tozalash
    data.lessons = data.lessons.filter(function (l) { return l.courseId !== id; });
    data.modules = data.modules.filter(function (m) { return m.courseId !== id; });
    data.enrollments = data.enrollments.filter(function (e) { return e.courseId !== id; });
    data.payments = data.payments.filter(function (p) { return p.courseId !== id; });
    data.certificates = data.certificates.filter(function (x) { return x.courseId !== id; });
    data.reviews = data.reviews.filter(function (r) { return r.courseId !== id; });
    data.questions = data.questions.filter(function (q) { return q.courseId !== id; });
    // testlar
    var testIds = data.tests.filter(function (t) { return t.courseId === id; }).map(function (t) { return t.id; });
    data.testResults = data.testResults.filter(function (tr) { return testIds.indexOf(tr.testId) < 0; });
    data.tests = data.tests.filter(function (t) { return t.courseId !== id; });
    // progress (lesson ids of this course)
    var lessonIds = {};
    // lessons already filtered; progress may reference old lesson ids — drop orphans if needed
    data.progress = (data.progress || []).filter(function (p) {
      // keep progress if lesson still exists
      return data.lessons.some(function (l) { return l.id === p.lessonId; });
    });
    remove("courses", id);
    log(byUser || "Teacher", role || "teacher", "Kursni o'chirdi", title, "content");
    return { ok: true };
  }

  // ---------- ANALYTICS ----------
  function money(n) { return (n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm"; }
  function analytics() {
    var students = data.users.filter(function (u) { return u.role === "student"; });
    var teachers = data.users.filter(function (u) { return u.role === "teacher"; });
    var managers = data.users.filter(function (u) { return u.role === "manager"; });
    var pubCourses = data.courses.filter(function (c) { return c.status === "published"; });
    var revenue = data.payments.filter(function (p) { return p.status === "paid"; }).reduce(function (s, p) { return s + p.amount; }, 0);
    return {
      users: data.users.length,
      students: students.length,
      teachers: teachers.length,
      managers: managers.length,
      courses: data.courses.length,
      publishedCourses: pubCourses.length,
      draftCourses: data.courses.filter(function (c) { return c.status === "draft"; }).length,
      pendingCourses: data.courses.filter(function (c) { return c.status === "pending"; }).length,
      lessons: data.lessons.length,
      enrollments: data.enrollments.length,
      payments: data.payments.length,
      paidPayments: data.payments.filter(function (p) { return p.status === "paid"; }).length,
      pendingPayments: data.payments.filter(function (p) { return p.status === "pending"; }).length,
      failedPayments: data.payments.filter(function (p) { return p.status === "failed"; }).length,
      certificates: data.certificates.length,
      revenue: revenue,
      revenueLabel: money(revenue)
    };
  }
  function topCourses(n) {
    return data.courses.map(function (c) {
      var cnt = data.enrollments.filter(function (e) { return e.courseId === c.id; }).length;
      return { id: c.id, title: c.title, cat: c.cat, enrollments: cnt, revenue: c.price * cnt };
    }).sort(function (a, b) { return b.enrollments - a.enrollments; }).slice(0, n || 5);
  }

  // ---------- EXPORT ----------
  window.ProSkillDB = {
    raw: function () { return data; },
    table: table, byId: byId, insert: insert, update: update, remove: remove, save: save, reset: reset, reloadFromStorage: reloadFromStorage,
    session: session, currentUser: currentUser, login: login, loginAs: loginAs, register: register, logout: logout,
    userName: userName, userAvatar: userAvatar, updateProfile: updateProfile, courseTitle: courseTitle, lessonsOf: lessonsOf, modulesOf: modulesOf,
    isEnrolled: isEnrolled, enrollmentsOf: enrollmentsOf, isDone: isDone, progressFor: progressFor, progressCount: progressCount,
    enrollFree: enrollFree, requestPayment: requestPayment, approvePayment: approvePayment, rejectPayment: rejectPayment, manualEnroll: manualEnroll,
    completeLesson: completeLesson, submitTest: submitTest, testResultFor: testResultFor,
    testsOfCourse: testsOfCourse, testsOfTeacher: testsOfTeacher, addTest: addTest, updateTest: updateTest, toggleTestActive: toggleTestActive,
    testStats: testStats, resultsOfTest: resultsOfTest,
    assignmentsOfTeacher: assignmentsOfTeacher, assignmentStats: assignmentStats, addAssignment: addAssignment,
    gradeAssignmentSub: gradeAssignmentSub, gradeAllPending: gradeAllPending,
    issueCertificate: issueCertificate,
    addReview: addReview, addLessonComment: addLessonComment, commentsOfLesson: commentsOfLesson,
    askQuestion: askQuestion, answerQuestion: answerQuestion,
    notify: notify, notificationsOf: notificationsOf, markNotifRead: markNotifRead, log: log,
    setUserStatus: setUserStatus, setUserRole: setUserRole, deleteUser: deleteUser,
    addTeacher: addTeacher, updateTeacher: updateTeacher, assignCourseTeacher: assignCourseTeacher,
    teacherReviews: teacherReviews, teacherRating: teacherRating, teacherPayouts: teacherPayouts,
    setCourseStatus: setCourseStatus, toggleFeatured: toggleFeatured, addCourse: addCourse, updateCourse: updateCourse, deleteCourse: deleteCourse,
    addModule: addModule, updateModule: updateModule, deleteModule: deleteModule,
    addLesson: addLesson, updateLesson: updateLesson, deleteLesson: deleteLesson,
    analytics: analytics, topCourses: topCourses, money: money,
    // CRM helpers
    addLead: function (row, byUser) {
      if (!row || !row.name) return { ok: false, error: "Ism majburiy" };
      var l = insert("leads", {
        name: String(row.name).trim(),
        phone: row.phone || "",
        source: row.source || "Sayt",
        stage: row.stage || "new",
        interest: row.interest || "",
        note: row.note || "",
        managerId: row.managerId || null,
        lastContact: todayLabel(),
        createdAt: todayLabel()
      });
      log(byUser || "Manager", "manager", "Yangi lead qo'shdi", l.name, "crm");
      return { ok: true, lead: l };
    },
    updateLead: function (id, patch, byUser) {
      var l = byId("leads", id); if (!l) return { ok: false, error: "Lead topilmadi" };
      update("leads", id, patch || {});
      log(byUser || "Manager", "manager", "Lead yangilandi", l.name, "crm");
      return { ok: true, lead: byId("leads", id) };
    },
    convertLead: function (id, byUser) {
      var l = byId("leads", id); if (!l) return { ok: false, error: "Lead topilmadi" };
      update("leads", id, { stage: "won", lastContact: todayLabel() });
      log(byUser || "Manager", "manager", "Lead konversiya", l.name, "crm");
      return { ok: true };
    },
    addDebt: function (row, byUser) {
      if (!row || !row.studentId || !row.amount) return { ok: false, error: "Student va summa majburiy" };
      var d = insert("debts", {
        studentId: row.studentId,
        courseId: row.courseId || null,
        amount: Number(row.amount) || 0,
        dueDate: row.dueDate || todayLabel(),
        status: row.status || "due",
        note: row.note || "",
        reminders: 0
      });
      log(byUser || "Manager", "manager", "Qarz yozdi", userName(row.studentId) + " · " + money(d.amount), "crm");
      return { ok: true, debt: d };
    },
    remindDebt: function (id, byUser) {
      var d = byId("debts", id); if (!d) return { ok: false, error: "Qarz topilmadi" };
      d.reminders = (d.reminders || 0) + 1;
      d.status = d.status === "paid" ? "paid" : "overdue";
      save();
      if (d.studentId) notify(d.studentId, "To'lov eslatmasi", "Qarzdorlik: " + money(d.amount) + ". Iltimos, to'lovni amalga oshiring.");
      log(byUser || "Manager", "manager", "Qarz eslatmasi", userName(d.studentId), "crm");
      return { ok: true };
    },
    payDebt: function (id, byUser) {
      var d = byId("debts", id); if (!d) return { ok: false, error: "Qarz topilmadi" };
      d.status = "paid"; save();
      log(byUser || "Manager", "manager", "Qarz yopildi", userName(d.studentId), "crm");
      return { ok: true };
    },
    addBranch: function (row, byUser) {
      if (!row || !row.name) return { ok: false, error: "Filial nomi majburiy" };
      var b = insert("branches", {
        name: String(row.name).trim(),
        address: row.address || "",
        phone: row.phone || "",
        manager: row.manager || "",
        active: row.active !== false
      });
      log(byUser || "Manager", "manager", "Filial qo'shdi", b.name, "crm");
      return { ok: true, branch: b };
    },
    addGroup: function (row, byUser) {
      if (!row || !row.name) return { ok: false, error: "Guruh nomi majburiy" };
      var g = insert("groups", {
        branchId: row.branchId || null,
        name: String(row.name).trim(),
        courseId: row.courseId || null,
        teacherId: row.teacherId || null,
        room: row.room || "",
        schedule: row.schedule || "",
        capacity: Number(row.capacity) || 15,
        students: Number(row.students) || 0,
        status: row.status || "active"
      });
      log(byUser || "Manager", "manager", "Guruh ochdi", g.name, "crm");
      return { ok: true, group: g };
    },
    addTask: function (row, byUser) {
      if (!row || !row.title) return { ok: false, error: "Vazifa nomi majburiy" };
      var t = insert("tasks", {
        title: String(row.title).trim(),
        assignee: row.assignee || "Manager",
        due: row.due || todayLabel(),
        priority: row.priority || "medium",
        status: row.status || "open",
        section: row.section || "general"
      });
      log(byUser || "Manager", "manager", "Vazifa qo'shdi", t.title, "crm");
      return { ok: true, task: t };
    },
    toggleTask: function (id) {
      var t = byId("tasks", id); if (!t) return { ok: false };
      t.status = t.status === "done" ? "open" : "done";
      save();
      return { ok: true, task: t };
    },
    crmStats: function () {
      var leads = data.leads || [];
      var debts = data.debts || [];
      var groups = data.groups || [];
      var tasks = data.tasks || [];
      var exp = (data.expenses || []).reduce(function (s, e) { return s + (e.amount || 0); }, 0);
      var income = (data.payments || []).filter(function (p) { return p.status === "paid"; }).reduce(function (s, p) { return s + (p.amount || 0); }, 0);
      return {
        leadsTotal: leads.length,
        leadsNew: leads.filter(function (l) { return l.stage === "new" || l.stage === "contacted"; }).length,
        debtsTotal: debts.filter(function (d) { return d.status !== "paid"; }).length,
        debtsSum: debts.filter(function (d) { return d.status !== "paid"; }).reduce(function (s, d) { return s + (d.amount || 0); }, 0),
        activeGroups: groups.filter(function (g) { return g.status === "active"; }).length,
        openTasks: tasks.filter(function (t) { return t.status !== "done"; }).length,
        income: income,
        expenses: exp,
        profit: income - exp
      };
    }
  };
})();