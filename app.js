import {
  REVIZA_CONFIG,
  isEmailJsConfigured,
} from "./config.js";
import {
  GoogleAuthProvider,
  auth,
  firebaseError,
  isFirebaseReady,
  onAuthStateChanged,
  readAllUsers,
  readUserProfile,
  saveUserProfile,
  serverTimestamp,
  signInWithPopup,
  signOut,
  updateProfile,
} from "./firebase.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let currentUser = null;
let currentPhotoDataUrl = "";
let toastTimer;

function toast(message, tone = "default") {
  const node = $("#toast");
  if (!node) return;
  node.textContent = message;
  node.dataset.tone = tone;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 3600);
}

function lockScroll(locked) {
  document.body.classList.toggle("is-locked", locked);
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  lockScroll(true);
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  if (!$(".modal.open, .drawer.open")) lockScroll(false);
}

function setupModals() {
  $$("[data-info-modal]").forEach((trigger) => {
    trigger.addEventListener("click", () => openModal("infoModal"));
  });
  $$("[data-close-modal]").forEach((trigger) => {
    trigger.addEventListener("click", () => closeModal(trigger.closest(".modal")));
  });
  $$(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const open = $(".modal.open");
    if (open) closeModal(open);
    const drawer = $(".drawer.open");
    if (drawer) closeDrawer();
  });
}

const drawer = $("#siteDrawer");
const menuButton = $("#menuToggle");

function closeDrawer() {
  if (!drawer) return;
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  menuButton?.setAttribute("aria-expanded", "false");
  if (!$(".modal.open")) lockScroll(false);
}

function setupDrawer() {
  if (!drawer || !menuButton) return;
  menuButton.addEventListener("click", () => {
    const isOpen = drawer.classList.toggle("open");
    drawer.setAttribute("aria-hidden", String(!isOpen));
    menuButton.setAttribute("aria-expanded", String(isOpen));
    lockScroll(isOpen);
  });
  $("#drawerClose")?.addEventListener("click", closeDrawer);
  $("#drawerBackdrop")?.addEventListener("click", closeDrawer);
  $$(".drawer-link").forEach((link) => link.addEventListener("click", closeDrawer));
}

function userLabel(user) {
  return user?.displayName || user?.email?.split("@")[0] || "Pengguna";
}

function updateAuthUI(user) {
  currentUser = user;
  const guest = $("#guestAuth");
  const signedIn = $("#signedInAuth");
  const profileButtons = $$(".requires-user");
  if (guest) guest.hidden = Boolean(user);
  if (signedIn) signedIn.hidden = !user;
  profileButtons.forEach((item) => {
    item.hidden = !user;
  });
  if (!user) {
    $("#userName") && ($("#userName").textContent = "Guest mode");
    return;
  }
  const name = userLabel(user);
  const photo = user.photoURL || "assets/favicon.svg";
  $("#userName") && ($("#userName").textContent = name);
  $("#userEmail") && ($("#userEmail").textContent = user.email || "");
  $("#profilePreview") && ($("#profilePreview").src = photo);
  $$(".user-avatar").forEach((image) => {
    image.src = photo;
    image.alt = `Foto profil ${name}`;
  });
  $("#profileName") && ($("#profileName").value = name);
  $("#profilePhotoUrl") && ($("#profilePhotoUrl").value = user.photoURL || "");
}

function welcomeParameters(user) {
  return {
    to_email: user.email,
    to_name: userLabel(user),
    subject: "Selamat datang di REVIZA",
    message: `Halo ${userLabel(user)}, login Google Anda berhasil. Selamat datang di REVIZA.`,
  };
}

async function sendEmail(templateId, parameters) {
  if (!isEmailJsConfigured() || !window.emailjs) return false;
  await window.emailjs.send(
    REVIZA_CONFIG.emailjs.serviceId,
    templateId,
    parameters,
  );
  return true;
}

async function syncUser(user) {
  if (!user || !isFirebaseReady()) return;
  const previous = await readUserProfile(user.uid);
  await saveUserProfile(user.uid, {
    uid: user.uid,
    email: user.email || "",
    displayName: userLabel(user),
    photoURL: user.photoURL || "",
    lastLoginAt: serverTimestamp(),
    ...(previous ? {} : { createdAt: serverTimestamp() }),
  });
  if (!previous) {
    try {
      const sent = await sendEmail(REVIZA_CONFIG.emailjs.welcomeTemplateId, welcomeParameters(user));
      toast(
        sent
          ? "Login berhasil. Email selamat datang dikirim."
          : "Login berhasil. Isi konfigurasi EmailJS untuk mengaktifkan email welcome.",
        sent ? "success" : "warning",
      );
    } catch {
      toast("Login berhasil. Email welcome belum terkirim; cek konfigurasi EmailJS.", "warning");
    }
  }
}

async function login() {
  if (!isFirebaseReady()) {
    toast(firebaseError || "Firebase belum dikonfigurasi.", "warning");
    return;
  }
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (error) {
    toast(error?.code === "auth/popup-closed-by-user" ? "Login dibatalkan." : "Login Google gagal.", "warning");
  }
}

function setupAuth() {
  $("#loginButton")?.addEventListener("click", login);
  $("#logoutButton")?.addEventListener("click", async () => {
    if (!auth) return;
    await signOut(auth);
    toast("Anda sudah logout.");
  });
  $("#profileButton")?.addEventListener("click", () => {
    if (!currentUser) return toast("Silakan login terlebih dahulu.", "warning");
    openModal("profileModal");
  });
  if (!auth) {
    updateAuthUI(null);
    return;
  }
  onAuthStateChanged(auth, async (user) => {
    updateAuthUI(user);
    if (!user) return;
    try {
      await syncUser(user);
    } catch {
      toast("Login berhasil, tetapi sinkronisasi profil Firestore gagal.", "warning");
    }
    if (document.body.dataset.page === "admin") loadAdminPanel();
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setupProfile() {
  $("#profilePhotoFile")?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 450000) {
      toast("Gunakan foto di bawah 450 KB agar aman disimpan di Firestore.", "warning");
      event.target.value = "";
      return;
    }
    currentPhotoDataUrl = await readFileAsDataUrl(file);
    $("#profilePreview") && ($("#profilePreview").src = currentPhotoDataUrl);
  });
  $("#profileForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!currentUser || !isFirebaseReady()) return toast("Login dan isi Firebase Config terlebih dahulu.", "warning");
    const displayName = $("#profileName").value.trim();
    const photoURL = currentPhotoDataUrl || $("#profilePhotoUrl").value.trim() || currentUser.photoURL || "";
    if (!displayName) return toast("Nama lengkap wajib diisi.", "warning");
    const button = $("#profileSave");
    button.disabled = true;
    try {
      await updateProfile(currentUser, { displayName, photoURL });
      await saveUserProfile(currentUser.uid, {
        uid: currentUser.uid,
        email: currentUser.email || "",
        displayName,
        photoURL,
        updatedAt: serverTimestamp(),
      });
      updateAuthUI(currentUser);
      $("#profilePreview") && ($("#profilePreview").src = photoURL || "assets/favicon.svg");
      currentPhotoDataUrl = "";
      toast("Profil berhasil diperbarui.", "success");
      closeModal($("#profileModal"));
    } catch {
      toast("Profil belum tersimpan. Periksa Firebase Rules dan konfigurasi.", "warning");
    } finally {
      button.disabled = false;
    }
  });
}

async function loadAdminPanel() {
  const panel = $("#adminPanel");
  const gate = $("#adminGate");
  if (!panel || !gate) return;
  const isAdmin = currentUser && REVIZA_CONFIG.adminEmails
    .map((email) => email.toLowerCase())
    .includes(currentUser.email?.toLowerCase());
  panel.hidden = !isAdmin;
  gate.hidden = Boolean(isAdmin);
  if (!isAdmin) return;
  const list = $("#userList");
  list.innerHTML = '<div class="empty-state">Memuat daftar pengguna...</div>';
  try {
    const users = await readAllUsers();
    $("#userCount").textContent = `${users.length} user terdaftar`;
    list.innerHTML = users.length
      ? users.map((user) => `<div class="user-row"><div><strong>${escapeHtml(user.displayName || "Tanpa nama")}</strong><span>${escapeHtml(user.email || "Email tidak tersedia")}</span></div><small>${user.lastLoginAt ? "Aktif" : "Baru"}</small></div>`).join("")
      : '<div class="empty-state">Belum ada user di Firestore.</div>';
    panel.dataset.users = JSON.stringify(users);
  } catch {
    list.innerHTML = '<div class="empty-state">Daftar user belum bisa dibaca. Periksa Firestore Rules.</div>';
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[char]));
}

function setupAdmin() {
  $("#refreshUsers")?.addEventListener("click", loadAdminPanel);
  $("#broadcastForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!currentUser) return toast("Login sebagai admin terlebih dahulu.", "warning");
    const allowed = REVIZA_CONFIG.adminEmails.map((email) => email.toLowerCase()).includes(currentUser.email?.toLowerCase());
    if (!allowed) return toast("Akun ini bukan admin yang diizinkan.", "warning");
    if (!isEmailJsConfigured() || !window.emailjs) return toast("Isi konfigurasi EmailJS terlebih dahulu.", "warning");
    const users = JSON.parse($("#adminPanel").dataset.users || "[]").filter((user) => user.email);
    if (!users.length) return toast("Belum ada daftar penerima.", "warning");
    const subject = $("#broadcastSubject").value.trim();
    const message = $("#broadcastMessage").value.trim();
    if (!subject || !message) return toast("Subjek dan isi pesan wajib diisi.", "warning");
    const button = $("#broadcastButton");
    button.disabled = true;
    button.textContent = "Mengirim...";
    const results = await Promise.allSettled(users.map((user) => sendEmail(
      REVIZA_CONFIG.emailjs.broadcastTemplateId,
      { to_email: user.email, to_name: user.displayName || "Pengguna REVIZA", subject, message },
    )));
    const sent = results.filter((result) => result.status === "fulfilled").length;
    toast(`Broadcast selesai: ${sent}/${users.length} email berhasil.`, sent === users.length ? "success" : "warning");
    button.disabled = false;
    button.textContent = "Kirim broadcast";
  });
}

function setupCopyButton() {
  $("#copyDana")?.addEventListener("click", async () => {
    const number = $("#danaNumber")?.textContent.trim();
    if (!number) return;
    try {
      await navigator.clipboard.writeText(number);
      toast("Nomor DANA berhasil disalin.", "success");
    } catch {
      window.prompt("Salin nomor DANA ini:", number);
    }
  });
}

function setupNoCopy() {
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  document.addEventListener("dragstart", (event) => {
    if (!(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
      event.preventDefault();
    }
  });
  document.addEventListener("selectstart", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement) && !(target instanceof HTMLSelectElement)) {
      event.preventDefault();
    }
  });
}

function setupEmailJs() {
  if (isEmailJsConfigured() && window.emailjs) {
    window.emailjs.init({ publicKey: REVIZA_CONFIG.emailjs.publicKey });
  }
}

setupEmailJs();
setupDrawer();
setupModals();
setupAuth();
setupProfile();
setupAdmin();
setupCopyButton();
setupNoCopy();

if (document.body.dataset.page === "produk") {
  import("./products.js");
}
