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
      { id: "u_tch1",    name: "Sardor Aliyev",    email: "sardor@proskill.uz",  password: "teacher", role: "teacher",    status: "active",  joined: "12 Yan 2025", last: "2 soat oldin", bio: "Senior Python & Backend dasturchi, 8 yil tajriba", spec: "Python, Django, Backend" },
      { id: "u_tch2",    name: "Dilnoza Karimova", email: "dilnoza@proskill.uz", password: "teacher", role: "teacher",    status: "active",  joined: "03 Fev 2025", last: "5 soat oldin", bio: "Frontend mutaxassis, React eksperti", spec: "Frontend, React" },
      { id: "u_tch3",    name: "Aziza Rahimova",   email: "aziza@proskill.uz",   password: "teacher", role: "teacher",    status: "active",  joined: "18 Yan 2025", last: "Kecha", bio: "Data Science & AI tadqiqotchisi", spec: "Data Science, AI" },
      { id: "u_tch4",    name: "Madina Yusupova",  email: "madina@proskill.uz",  password: "teacher", role: "teacher",    status: "active",  joined: "22 Fev 2025", last: "3 kun oldin", bio: "Grafik dizayner, Figma trener", spec: "Grafik dizayn" },
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
          lessons.push({
            id: "les_" + c.id + "_" + mi + "_" + li,
            moduleId: modId, courseId: c.id, title: lt,
            duration: (8 + ((mi * 3 + li) % 14)) + ":" + ("0" + ((li * 17) % 60)).slice(-2),
            free: (mi === 0 && li === 0), order: li
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
      { id: "tst_4", courseId: "c4", moduleRef: "Modul 1", title: "Dizayn asoslari — Test", passPercent: 60, active: true,
        questions: [
          { q: "Figma nima uchun ishlatiladi?", options: ["Video montaj", "UI/UX dizayn", "Dasturlash", "Hisob-kitob"], correct: 1 },
          { q: "RGB nimaning qisqartmasi?", options: ["Red Green Blue", "Right Good Best", "Run Get Build", "Real Graphic Base"], correct: 0 }
        ] }
    ];
    var testResults = [
      { id: uid("res"), studentId: "u_std1", testId: "tst_1", score: 85, correct: 4, wrong: 1, percentage: 85, passed: true, date: "10 May 2026" },
      { id: uid("res"), studentId: "u_std1", testId: "tst_2", score: 72, correct: 2, wrong: 1, percentage: 72, passed: true, date: "18 May 2026" },
      { id: uid("res"), studentId: "u_std1", testId: "tst_4", score: 90, correct: 2, wrong: 0, percentage: 90, passed: true, date: "08 Iyun 2026" }
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

    return {
      users: users, categories: categories, courses: courses, modules: modules, lessons: lessons,
      enrollments: enrollments, progress: progress, payments: payments, tests: tests, testResults: testResults,
      certificates: certificates, reviews: reviews, questions: questions, notifications: notifications,
      logs: logs, settings: settings
    };
  }

  // ---------- LOAD / SAVE ----------
  var data;
  function load() {
    try { var r = localStorage.getItem(DB_KEY); if (r) return JSON.parse(r); } catch (e) {}
    var s = seed();
    try { localStorage.setItem(DB_KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }
  data = load();
  function save() { try { localStorage.setItem(DB_KEY, JSON.stringify(data)); } catch (e) {} }
  function reset() { data = seed(); save(); try { localStorage.removeItem(SESSION_KEY); } catch (e) {} }

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
  function courseTitle(id) { var c = byId("courses", id); return c ? c.title : "—"; }
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
  function approvePayment(paymentId, byUser) {
    var p = byId("payments", paymentId); if (!p) return { ok: false };
    p.status = "paid"; 
    if (!isEnrolled(p.studentId, p.courseId))
      insert("enrollments", { studentId: p.studentId, courseId: p.courseId, type: "paid", status: "active", createdAt: todayLabel() });
    save();
    notify(p.studentId, "To'lov tasdiqlandi", '"' + courseTitle(p.courseId) + '" kursi ochildi. O\'qishni boshlang!');
    log(byUser || "Manager", "manager", "To'lovni tasdiqladi", p.id + " · " + courseTitle(p.courseId), "payment");
    return { ok: true };
  }
  function rejectPayment(paymentId, reason, byUser) {
    var p = byId("payments", paymentId); if (!p) return { ok: false };
    p.status = "failed"; p.reason = reason || "To'lov rad etildi"; save();
    notify(p.studentId, "To'lov rad etildi", '"' + courseTitle(p.courseId) + '" uchun to\'lov rad etildi: ' + p.reason);
    log(byUser || "Manager", "manager", "To'lovni rad qildi", p.id, "payment");
    return { ok: true };
  }
  function manualEnroll(studentEmailOrName, courseTitleOrId, byUser) {
    var u = data.users.filter(function (x) { return x.email.toLowerCase() === (studentEmailOrName || "").toLowerCase() || x.name.toLowerCase() === (studentEmailOrName || "").toLowerCase(); })[0];
    var c = data.courses.filter(function (x) { return x.id === courseTitleOrId || x.title.toLowerCase().indexOf((courseTitleOrId || "").toLowerCase()) >= 0; })[0];
    if (!u || !c) return { ok: false, error: "Student yoki kurs topilmadi" };
    if (isEnrolled(u.id, c.id)) return { ok: false, error: "Allaqachon yozilgan" };
    insert("enrollments", { studentId: u.id, courseId: c.id, type: "paid", status: "active", createdAt: todayLabel() });
    notify(u.id, "Kurs ochildi", '"' + c.title + '" kursi qo\'lda ochildi.');
    log(byUser || "Manager", "manager", "Qo'lda kursga yozdi", u.name + " → " + c.title, "enroll");
    return { ok: true };
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
  // course management
  function setCourseStatus(id, status, byUser, role) {
    var c = byId("courses", id); if (!c) return { ok: false };
    c.status = status; save();
    log(byUser || "Admin", role || "superadmin", "Kurs holatini o'zgartirdi", c.title + " → " + status, "content");
    return { ok: true };
  }
  function toggleFeatured(id) { var c = byId("courses", id); if (c) { c.featured = !c.featured; save(); } return { ok: true }; }
  function addCourse(row, byUser, role) {
    if (!row || !row.title) return { ok: false, error: "Kurs nomi majburiy" };
    var c = insert("courses", Object.assign({
      rating: 0, status: "draft", featured: false, level: "Boshlang'ich",
      price: 0, desc: "", comment: "", cat: "Python"
    }, row));
    log(byUser || "Teacher", role || "teacher", "Yangi kurs yaratdi", c.title + " (draft)", "content");
    return { ok: true, course: c };
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
    table: table, byId: byId, insert: insert, update: update, remove: remove, save: save, reset: reset,
    session: session, currentUser: currentUser, login: login, loginAs: loginAs, register: register, logout: logout,
    userName: userName, courseTitle: courseTitle, lessonsOf: lessonsOf, modulesOf: modulesOf,
    isEnrolled: isEnrolled, enrollmentsOf: enrollmentsOf, isDone: isDone, progressFor: progressFor, progressCount: progressCount,
    enrollFree: enrollFree, requestPayment: requestPayment, approvePayment: approvePayment, rejectPayment: rejectPayment, manualEnroll: manualEnroll,
    completeLesson: completeLesson, submitTest: submitTest, testResultFor: testResultFor, issueCertificate: issueCertificate,
    addReview: addReview, askQuestion: askQuestion, answerQuestion: answerQuestion,
    notify: notify, notificationsOf: notificationsOf, markNotifRead: markNotifRead, log: log,
    setUserStatus: setUserStatus, setUserRole: setUserRole, deleteUser: deleteUser,
    setCourseStatus: setCourseStatus, toggleFeatured: toggleFeatured, addCourse: addCourse, deleteCourse: deleteCourse,
    addModule: addModule, updateModule: updateModule, deleteModule: deleteModule,
    analytics: analytics, topCourses: topCourses, money: money
  };
})();