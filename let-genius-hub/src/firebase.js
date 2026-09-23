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
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, getDoc, onSnapshot, runTransaction, serverTimestamp } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

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
  // Keep Firestore's client cache on disk. This is critical for TOPNOTCHER:
  // writes made while a user is offline or immediately before a reload/close
  // are retained and synchronized when connectivity returns. Multiple tabs
  // share the same persistent cache where the browser supports it.
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch {
    // Another initialized Firestore instance or an older browser can make the
    // persistent-cache initializer unavailable. Fall back to the normal client.
    db = getFirestore(app);
  }
  storage = getStorage(app);
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
const DEVICE_VERIFIED_KEY = "topnotcher-device-verified-v2";
const DEVICE_TRUST_KEY = "topnotcher-device-trust-v1";
const DEVICE_VERIFIED_MAX_AGE = 1000 * 60 * 60 * 24 * 30;

function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = (globalThis.crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function verifiedDeviceKey(uid) {
  return `${DEVICE_VERIFIED_KEY}:${uid}`;
}

function trustDeviceKey(uid) {
  return `${DEVICE_TRUST_KEY}:${uid}`;
}

function readVerifiedDevice(uid, allowExpired = false) {
  try {
    const raw = localStorage.getItem(verifiedDeviceKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.deviceId !== getDeviceId()) return null;
    if (!allowExpired && Date.now() - Number(parsed.verifiedAt || 0) > DEVICE_VERIFIED_MAX_AGE) return null;
    return parsed;
  } catch {
    return null;
  }
}

function rememberVerifiedDevice(uid, deviceId) {
  try {
    const payload = { deviceId, verifiedAt: Date.now() };
    localStorage.setItem(verifiedDeviceKey(uid), JSON.stringify(payload));
    // Durable trust is intentionally separate from the active slot. Signing out
    // must not erase the identity of a browser that has already used this account.
    localStorage.setItem(trustDeviceKey(uid), JSON.stringify({ deviceId, trustedAt: Date.now() }));
  } catch {}
}

function rememberHistoricalTrust(uid) {
  try {
    const deviceId = getDeviceId();
    const active = readVerifiedDevice(uid, true);
    if (active?.deviceId === deviceId) return true;
    const raw = localStorage.getItem(trustDeviceKey(uid));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.deviceId === deviceId) return true;
    }
    // V89 could have left account-scoped local data behind even when its
    // temporary verification cache was removed. Treat that as a recovery hint
    // only when this exact browser already contains data for this Firebase UID.
    const suffix = `::${uid}`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (key.endsWith(suffix)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function forgetVerifiedDevice(uid) {
  // Do NOT delete durable trust. It is needed so an already-used browser can
  // recover after an accidental sign-out or a temporary Firestore outage.
  try { localStorage.removeItem(verifiedDeviceKey(uid)); } catch {}
}

export async function registerAccountDevice(uid) {
  if (!uid) return { ok: true, deviceId: getDeviceId(), disabled: true };
  const deviceId = getDeviceId();
  const cached = readVerifiedDevice(uid);
  const historicalTrust = rememberHistoricalTrust(uid);

  // Firebase/Firestore is optional for the local development fallback.
  if (!db) {
    if (historicalTrust) return { ok: true, deviceId, existing: true, cached: true, verificationPending: true };
    // Authentication itself remains the source of identity. If Firestore is not
    // configured, do not strand an otherwise valid signed-in user at a dead-end.
    return { ok: true, deviceId, verificationPending: true, disabled: true };
  }

  const ref = doc(db, "accounts", uid);
  try {
    const result = await runTransaction(db, async transaction => {
      const snap = await transaction.get(ref);
      const data = snap.exists() ? snap.data() : {};
      const rawDevices = data.devices && typeof data.devices === "object" ? data.devices : {};
      const devices = { ...rawDevices };
      const now = Date.now();
      const entries = Object.entries(devices).filter(([id, value]) => id && value && typeof value === "object");

      if (devices[deviceId]) {
        devices[deviceId] = { ...devices[deviceId], lastSeen: now };
        transaction.set(ref, { devices, updatedAt: serverTimestamp() }, { merge: true });
        return { ok: true, deviceId, existing: true };
      }

      if (entries.length >= 2) return { ok: false, deviceId, reason: "limit" };

      devices[deviceId] = {
        createdAt: now,
        lastSeen: now,
        label: `${globalThis.navigator?.platform || "Browser"} · ${globalThis.navigator?.userAgent?.match(/(Chrome|Safari|Firefox|Edge)/i)?.[1] || "Browser"}`
      };
      transaction.set(ref, { devices, updatedAt: serverTimestamp() }, { merge: true });
      return { ok: true, deviceId, existing: false };
    });
    if (result?.ok) rememberVerifiedDevice(uid, result.deviceId);
    return result;
  } catch (error) {
    // Never lock a previously used browser out merely because its Firestore
    // verification request failed. This is the recovery path for users who were
    // unexpectedly signed out and then could not re-enter their existing account.
    if (cached?.deviceId === deviceId || historicalTrust) {
      return { ok: true, deviceId, existing: true, cached: true, verificationPending: true, verificationError: error };
    }

    // A brand-new browser should also not be trapped behind a generic network
    // error. Allow authenticated entry while marking device registration as
    // pending. When Firestore becomes reachable, the next registration can still
    // enforce the two-device limit. This avoids a total login outage when rules,
    // connectivity, or a transient Firestore failure is the actual problem.
    console.warn("TOPNOTCHER device registration is temporarily unavailable; allowing authenticated entry pending verification.", error);
    return { ok: true, deviceId, verificationPending: true, verificationError: error };
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
    forgetVerifiedDevice(uid);
  } catch (error) {
    // Keep the local authorization if the network is unavailable. This avoids
    // turning an ordinary offline sign-out into an unusable account state.
    console.warn("Could not release TOPNOTCHER device slot", error);
  }
}

// Durable app-state synchronization. Array-based collections are merged by stable
// item id inside a Firestore transaction so two tabs/devices cannot accidentally
// overwrite each other's newly-created questions, decks, flashcards, sessions, etc.
// Explicit deletions are stored as tombstones in the same document, so a stale
// device cannot resurrect something the user deliberately deleted.
function mergeDurableArray(remoteValue, incomingValue, deletedIds=[]) {
  const remote = Array.isArray(remoteValue) ? remoteValue : [];
  const incoming = Array.isArray(incomingValue) ? incomingValue : [];
  const deleted = new Set((Array.isArray(deletedIds) ? deletedIds : []).map(String));
  const byId = new Map();
  const anonymous = [];
  for (const item of remote) {
    const id = item && item.id !== undefined && item.id !== null ? String(item.id) : null;
    if (id === null) anonymous.push(item);
    else if (!deleted.has(id)) byId.set(id, item);
  }
  for (const item of incoming) {
    const id = item && item.id !== undefined && item.id !== null ? String(item.id) : null;
    if (id === null) anonymous.push(item);
    else if (!deleted.has(id)) byId.set(id, item);
  }
  return [...byId.values(), ...anonymous];
}

export async function getAccountState(uid, key) {
  if (!db || !uid) return { exists:false, value:undefined, clientUpdatedAt:0, deletedIds:[] };
  const snap = await getDoc(doc(db, "accounts", uid, "appState", key));
  if (!snap.exists()) return { exists:false, value:undefined, clientUpdatedAt:0, deletedIds:[] };
  const data=snap.data() || {};
  return { exists:true, value:data.value, clientUpdatedAt:Number(data.clientUpdatedAt || 0), deletedIds:Array.isArray(data.deletedIds) ? data.deletedIds.map(String) : [] };
}

export function subscribeAccountState(uid, key, onValue, onError) {
  if (!db || !uid) return () => {};
  const ref = doc(db, "accounts", uid, "appState", key);
  return onSnapshot(ref, snap => {
    const data=snap.exists() ? (snap.data() || {}) : {};
    onValue(snap.exists() ? data.value : undefined, snap.exists(), {
      clientUpdatedAt:Number(data.clientUpdatedAt || 0),
      deletedIds:Array.isArray(data.deletedIds) ? data.deletedIds.map(String) : []
    });
  }, onError);
}

export async function saveAccountState(uid, key, value, clientUpdatedAt=Date.now(), deletedIds=[]) {
  if (!db || !uid) return;
  const ref = doc(db, "accounts", uid, "appState", key);
  const incomingDeleted = Array.isArray(deletedIds) ? deletedIds.map(String) : [];
  const payload = { value, deletedIds: incomingDeleted.slice(-5000), clientUpdatedAt:Number(clientUpdatedAt)||Date.now(), updatedAt: serverTimestamp() };
  try {
    await runTransaction(db, async transaction => {
      const snap = await transaction.get(ref);
      const existing = snap.exists() ? (snap.data() || {}) : {};
      const existingDeleted = Array.isArray(existing.deletedIds) ? existing.deletedIds.map(String) : [];
      const allDeleted = [...new Set([...existingDeleted, ...incomingDeleted])];
      const hasArrayValue = Array.isArray(value) || Array.isArray(existing.value);
      const nextValue = hasArrayValue
        ? mergeDurableArray(existing.value, Array.isArray(value) ? value : [], allDeleted)
        : value;
      const ts = Math.max(Number(existing.clientUpdatedAt || 0), Number(clientUpdatedAt) || Date.now());
      transaction.set(ref, {
        value: nextValue,
        deletedIds: allDeleted.slice(-5000),
        clientUpdatedAt: ts,
        updatedAt: serverTimestamp()
      }, { merge: true });
    });
  } catch (transactionError) {
    // Transactions cannot complete while the browser is offline. Do not lose
    // the user's save: Firestore's persistent local cache queues this ordinary
    // write and syncs it when the connection returns. The next online save
    // transaction reconciles concurrent changes and tombstones.
    await setDoc(ref, payload, { merge: true });
  }
}



export const firebaseStorageConfigured = Boolean(storage);

export async function uploadAccountMaterial(uid, materialId, file) {
  if (!storage || !uid) throw new Error("Cloud file storage is not configured.");
  const safeName = String(file?.name || "material").replace(/[^a-zA-Z0-9._-]+/g, "_");
  const path = `materials/${uid}/${materialId}-${safeName}`;
  const ref = storageRef(storage, path);
  const snapshot = await uploadBytes(ref, file, { contentType: file?.type || "application/octet-stream" });
  const downloadURL = await getDownloadURL(snapshot.ref);
  return { path, downloadURL };
}

export async function deleteAccountMaterial(path) {
  if (!storage || !path) return;
  await deleteObject(storageRef(storage, path));
}

export const firestoreConfigured = Boolean(db);
