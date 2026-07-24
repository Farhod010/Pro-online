/* ============================================================
   Google Sign-In sozlamalari
   ----------------------------------------------------------
   1) Google Cloud Console dan Web Client ID oling
   2) Quyidagi qiymatni almashtiring
   3) backend/.env ga ham shu Client ID ni yozing:
        GOOGLE_CLIENT_ID=....apps.googleusercontent.com
   ============================================================ */
window.PROSKILL_GOOGLE = {
  // Misol: "123456789-abcxyz.apps.googleusercontent.com"
  clientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  // Django API manzili (runserver 8000 bo'lsa o'zgartirmang)
  apiBase: "http://127.0.0.1:8000/api/auth"
};
