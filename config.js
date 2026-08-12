/*
  KONFIGURASI REVIZA
  ------------------------------------------------------------------
  Isi nilai di bawah ini dari Firebase Console dan EmailJS Dashboard.
  Jangan menaruh private key atau service account key di website statis.
*/
export const REVIZA_CONFIG = {
  /*
    FIREBASE WEB APP CONFIG
    Firebase Console -> Project settings -> Your apps -> Web app.
    Authentication -> Sign-in method -> aktifkan Google.
  */
  firebase: {
    apiKey: "GANTI_DENGAN_FIREBASE_API_KEY",
    authDomain: "GANTI_DENGAN_PROJECT_ID.firebaseapp.com",
    projectId: "GANTI_DENGAN_FIREBASE_PROJECT_ID",
    storageBucket: "GANTI_DENGAN_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "GANTI_DENGAN_MESSAGING_SENDER_ID",
    appId: "GANTI_DENGAN_FIREBASE_APP_ID",
  },

  /*
    EMAILJS CONFIG
    EmailJS Dashboard -> Account -> Public Key.
    Service ID dan Template ID dapat ditemukan pada Email Services dan Email Templates.
    Welcome template dipakai ketika dokumen user baru pertama kali dibuat.
    Broadcast template dipakai oleh halaman admin untuk setiap email penerima.
  */
  emailjs: {
    publicKey: "GANTI_DENGAN_EMAILJS_PUBLIC_KEY",
    serviceId: "GANTI_DENGAN_EMAILJS_SERVICE_ID",
    welcomeTemplateId: "GANTI_DENGAN_EMAILJS_WELCOME_TEMPLATE_ID",
    broadcastTemplateId: "GANTI_DENGAN_EMAILJS_BROADCAST_TEMPLATE_ID",
  },

  /*
    DAFTAR ADMIN / DEV
    Ganti dengan email Google developer. UI admin hanya dibuka untuk email di daftar ini.
    Tetap wajib mengunci collection users dengan Firestore Security Rules.
  */
  adminEmails: ["email-admin-anda@example.com"],
};

export function isFirebaseConfigured() {
  return Object.values(REVIZA_CONFIG.firebase).every(
    (value) => value && !String(value).startsWith("GANTI_DENGAN"),
  );
}

export function isEmailJsConfigured() {
  return Object.values(REVIZA_CONFIG.emailjs).every(
    (value) => value && !String(value).startsWith("GANTI_DENGAN"),
  );
}
