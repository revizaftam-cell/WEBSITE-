/*
  Firebase Authentication SDK v10 Modular + Firestore.
  Semua import sengaja memakai CDN agar folder ini tetap website statis.
*/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { REVIZA_CONFIG, isFirebaseConfigured } from "./config.js";

let auth = null;
let db = null;
let firebaseError = "";

if (isFirebaseConfigured()) {
  try {
    const firebaseApp = initializeApp(REVIZA_CONFIG.firebase);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  } catch (error) {
    firebaseError = error instanceof Error ? error.message : "Firebase gagal dimuat.";
  }
} else {
  firebaseError = "Firebase Config belum diisi di js/config.js.";
}

export {
  GoogleAuthProvider,
  auth,
  collection,
  db,
  doc,
  firebaseError,
  getDoc,
  getDocs,
  onAuthStateChanged,
  serverTimestamp,
  setDoc,
  signInWithPopup,
  signOut,
  updateProfile,
};

export function isFirebaseReady() {
  return Boolean(auth && db);
}

export async function readUserProfile(uid) {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveUserProfile(uid, data) {
  if (!db) throw new Error(firebaseError);
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function readAllUsers() {
  if (!db) throw new Error(firebaseError);
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}
