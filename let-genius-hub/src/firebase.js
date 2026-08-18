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

let auth = null;
let provider = null;

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
