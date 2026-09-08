import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot, runTransaction, serverTimestamp } from "firebase/firestore";

const required = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID"
];

export const firebaseConfig = Object.fromEntries(
  required.map((key) => [key, import.meta.env[key] || ""])
);

export const firebaseConfigured = required.every((key) => Boolean(firebaseConfig[key]));

// Comma-separated exact Google email addresses authorized to enter the app.
// Example: VITE_AUTHORIZED_GOOGLE_EMAILS=admin@example.com,student@example.com
const authorizedEmails = new Set(
  String(import.meta.env.VITE_AUTHORIZED_GOOGLE_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

export const authorizationConfigured = authorizedEmails.size > 0;

export function isAuthorizedGoogleUser(user) {
  const email = String(user?.email || "").trim().toLowerCase();
  // Fail closed: if no allowlist is configured, nobody is granted app access.
  return authorizationConfigured && Boolean(email) && authorizedEmails.has(email);
}

export function authorizedAccountDescription() {
  return authorizationConfigured ? `${authorizedEmails.size} authorized account${authorizedEmails.size === 1 ? "" : "s"}` : "No authorized accounts configured";
}

let auth = null;
let provider = null;
let db = null;

if (firebaseConfigured) {
  const app = initializeApp({
    apiKey: firebaseConfig.VITE_FIREBASE_API_KEY,
    authDomain: firebaseConfig.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: firebaseConfig.VITE_FIREBASE_PROJECT_ID,
    storageBucket: firebaseConfig.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: firebaseConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: firebaseConfig.VITE_FIREBASE_APP_ID
  });
  auth = getAuth(app);
  db = getFirestore(app);
  provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

export { auth };

export async function finishGoogleRedirect() {
  if (!auth) return null;
  try { return await getRedirectResult(auth); }
  catch (error) { throw error; }
}

export function watchAuth(callback) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  if (!auth || !provider) throw new Error("Firebase Google Authentication is not configured.");
  await setPersistence(auth, browserLocalPersistence);
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (mobile) {
    await signInWithRedirect(auth, provider);
    return null;
  }
  return signInWithPopup(auth, provider);
}

export async function signOutGoogle() {
  if (!auth) return;
  await signOut(auth);
}


const DEVICE_ID_KEY = "topnotcher-device-id-v1";
function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = (crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export async function registerAccountDevice(uid) {
  if (!db || !uid) return { ok: true, deviceId: getDeviceId(), disabled: true };
  const deviceId = getDeviceId();
  const ref = doc(db, "accounts", uid);
  try {
    const result = await runTransaction(db, async transaction => {
      const snap = await transaction.get(ref);
      const data = snap.exists() ? snap.data() : {};
      const devices = { ...(data.devices || {}) };
      const now = Date.now();
      const entries = Object.entries(devices).filter(([id, value]) => value && typeof value === "object");
      if (devices[deviceId]) {
        devices[deviceId] = { ...devices[deviceId], lastSeen: now };
        transaction.set(ref, { devices, updatedAt: serverTimestamp() }, { merge: true });
        return { ok: true, deviceId, existing: true };
      }
      // A device slot is an authenticated browser/device. Signing out frees it.
      if (entries.length >= 2) return { ok: false, deviceId, reason: "limit" };
      devices[deviceId] = {
        createdAt: now,
        lastSeen: now,
        label: `${navigator?.platform || "Browser"} · ${navigator?.userAgent?.match(/(Chrome|Safari|Firefox|Edge)/i)?.[1] || "Browser"}`
      };
      transaction.set(ref, { devices, updatedAt: serverTimestamp() }, { merge: true });
      return { ok: true, deviceId, existing: false };
    });
    return result;
  } catch (error) {
    return { ok: false, deviceId, reason: "error", error };
  }
}

export async function releaseAccountDevice(uid) {
  if (!db || !uid) return;
  const deviceId = getDeviceId();
  const ref = doc(db, "accounts", uid);
  try {
    await runTransaction(db, async transaction => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) return;
      const devices = { ...(snap.data().devices || {}) };
      delete devices[deviceId];
      transaction.set(ref, { devices, updatedAt: serverTimestamp() }, { merge: true });
    });
  } catch (error) {
    console.warn("Could not release TOPNOTCHER device slot", error);
  }
}

export function subscribeAccountState(uid, key, onValue, onError) {
  if (!db || !uid) return () => {};
  const ref = doc(db, "accounts", uid, "appState", key);
  return onSnapshot(ref, snap => {
    onValue(snap.exists() ? snap.data()?.value : undefined, snap.exists());
  }, onError);
}

export async function saveAccountState(uid, key, value) {
  if (!db || !uid) return;
  const ref = doc(db, "accounts", uid, "appState", key);
  await setDoc(ref, { value, updatedAt: serverTimestamp() }, { merge: true });
}

export const firestoreConfigured = Boolean(db);
