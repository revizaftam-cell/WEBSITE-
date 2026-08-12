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
    apiKey: "AIzaSyD0u2SZzorktYoDuRIHuN5QUY3GwH9lxbI",
    authDomain: "website-3b021.firebaseapp.com",
    projectId: "website-3b021",
    storageBucket: "website-3b021.firebasestorage.app",
    messagingSenderId: "41641431123",
    appId: "1:41641431123:web:2f375ccc5b9924e4fa76a6",
  },

  /*
    EMAILJS CONFIG (Isi nanti kalau mau pakai EmailJS)
  */
  emailjs: {
    publicKey: "GANTI_DENGAN_EMAILJS_PUBLIC_KEY",
    serviceId: "GANTI_DENGAN_EMAILJS_SERVICE_ID",
    welcomeTemplateId: "GANTI_DENGAN_EMAILJS_WELCOME_TEMPLATE_ID",
    broadcastTemplateId: "GANTI_DENGAN_EMAILJS_BROADCAST_TEMPLATE_ID",
  },

  /*
    DAFTAR ADMIN / DEV
    Ganti dengan email Google kamu yang dipakai login nanti.
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
