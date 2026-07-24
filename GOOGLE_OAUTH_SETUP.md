# Google orqali kirish (Google Sign-In) — ProSkill

## Loyiha texnologiyasi (haqiqiy stack)

| Qism | Texnologiya |
|------|-------------|
| Frontend | HTML/CSS/JS (`.dc.html` panellar), `proskill-db.js` (localStorage) |
| Backend | **Django 5** + Django REST Framework + SimpleJWT |
| DB | SQLite (`backend/db.sqlite3`) + brauzer **localStorage** (`proskill_db_v3`) |
| OAuth | Google Identity Services (GIS) + `POST /api/auth/google/` |

---

## 1-qadam: Google Cloud Console (Client ID olish)

### A) Loyiha ochish
1. Brauzerda oching: https://console.cloud.google.com/
2. Yuqorida **Select a project** → **New Project**
3. Nom: `ProSkill` → **Create**

### B) OAuth rozilik ekrani
1. Chap menyu: **APIs & Services** → **OAuth consent screen**
2. User Type: **External** → **Create**
3. App name: `ProSkill IT Academy`
4. User support email: o‘zingizning Gmail
5. Developer contact: o‘sha email
6. **Save and Continue**
7. Scopes: default (email, profile, openid) yetarli → **Save and Continue**
8. Test users (External + Testing rejimida): **+ ADD USERS** → o‘z Gmailingizni qo‘shing  
   (Production ga o‘tmaguncha faqat test userlar kira oladi)

### C) OAuth Client ID
1. **APIs & Services** → **Credentials** → **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Application type: **Web application**
3. Name: `ProSkill Web`
4. **Authorized JavaScript origins** (aniq yozing, oxirida `/` bo‘lmasin):
   - `http://127.0.0.1:8000`
   - `http://localhost:8000`
5. **Authorized redirect URIs** (GIS uchun odatda kerak emas, lekin qo‘shish mumkin):
   - `http://127.0.0.1:8000`
   - `http://localhost:8000`
6. **Create** → **Client ID** ni nusxa oling  
   Misol: `123456789-abcdefg.apps.googleusercontent.com`

---

## 2-qadam: Loyihaga Client ID ni yozish

### Frontend — `google-config.js` (loyiha ildizida)

```js
window.PROSKILL_GOOGLE = {
  clientId: "123456789-abcdefg.apps.googleusercontent.com",  // ← o‘zingizniki
  apiBase: "http://127.0.0.1:8000/api/auth"
};
```

### Backend — `backend/.env`

```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://127.0.0.1:8000,http://localhost:8000
```

`.env.example` dan nusxa:

```bash
cd backend
cp .env.example .env
# keyin .env ni tahrirlang
```

---

## 3-qadam: Paketlarni o‘rnatish va migratsiya

```bash
cd backend
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

---

## 4-qadam: Qanday ishlaydi (oddiy tushuncha)

```
[Brauzer] Google tugmasi
    → Google sizni tanlaydi, JWT "credential" beradi
    → Frontend: POST /api/auth/google/  { credential: "..." }
[Django] Tokenni Google bilan tekshiradi (soxta token ishlamaydi)
    → email/ism/rasm oladi
    → User yaratadi yoki topadi (role=student)
    → JWT access/refresh qaytaradi
[Brauzer] proskill-db.js loginWithGoogle() → local sessiya
    → ProSkill Student.dc.html ga yo‘naltiradi
```

---

## 5-qadam: API ni qo‘lda tekshirish

Google tugmasi ishlagach, brauzer Network da `POST /api/auth/google/` ko‘rinadi.

Muvaffaqiyatli javob misoli:

```json
{
  "ok": true,
  "created": true,
  "user": { "email": "...", "role": "student", "avatar_url": "https://..." },
  "tokens": { "access": "...", "refresh": "..." },
  "profile": { "name": "...", "email": "...", "avatar": "...", "googleId": "..." }
}
```

Xato misollari:
- `GOOGLE_CLIENT_ID sozlanmagan` → `.env` va `google-config.js` ni to‘ldiring
- `Google token yaroqsiz` → Client ID frontend/backend bir xil ekanini tekshiring; origin `http://127.0.0.1:8000` ro‘yxatda
- `Hisobingiz bloklangan` → Super Admin / Manager user status

---

## 6-qadam: Frontend kod joyi

| Fayl | Vazifa |
|------|--------|
| `google-config.js` | Client ID |
| `ProSkill IT Academy.dc.html` | Google tugma + `handleGoogleCredential` |
| `proskill-db.js` | `loginWithGoogle()` local user/sessiya |
| `backend/accounts/views.py` | `google_login_view` — token verify |
| `backend/accounts/urls.py` | `path('google/', ...)` |

---

## Xavfsizlik eslatmalari

1. **Productionda** faqat backend verify ishlatsin (local fallback faqat dev yordami).
2. Client ID ochiq (frontendda) bo‘lishi normal; **Client Secret** hech qachon frontendga qo‘ymang (bu loyihada secret kerak emas — ID token oqimi).
3. HTTPS domainga o‘tganda Google Console ga yangi origin qo‘shing: `https://sizning-domen.uz`
4. `DEBUG=False` va kuchli `SECRET_KEY` ishlating.

---

## Tez-tez uchraydigan muammolar

| Muammo | Yechim |
|--------|--------|
| Tugma ishlamaydi / "Client ID sozlanmagan" | `google-config.js` da real Client ID |
| `redirect_uri_mismatch` / origin xato | Console da `http://127.0.0.1:8000` (slash yo‘q) |
| "Access blocked: app not verified" | OAuth consent → Test users ga email qo‘shing |
| 503 / server xato | `runserver` ishlayaptimi? `pip install google-auth` |
| Kirgach o‘quvchi panel ochilmaydi | `loginWithGoogle` sessiyani saqlayaptimi — F12 → Application → Local Storage |

---

## Sinov ro‘yxati

1. [ ] Google Console Client ID olindi  
2. [ ] `google-config.js` va `backend/.env` to‘ldirildi  
3. [ ] `pip install -r requirements.txt` + `migrate`  
4. [ ] `runserver 127.0.0.1:8000`  
5. [ ] Login sahifada Google tugmasi  
6. [ ] Test user Gmail bilan kirish  
7. [ ] Student panel ochiladi, ism/email ko‘rinadi  
