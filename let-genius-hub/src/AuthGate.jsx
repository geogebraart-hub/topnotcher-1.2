import React, { useEffect, useRef, useState } from "react";
import { Chrome, Loader2, ShieldCheck } from "lucide-react";
import { firebaseConfigured, finishGoogleRedirect, signInWithGoogle, signOutGoogle, watchAuth, isAuthorizedGoogleUser, authorizedAccountDescription, registerAccountDevice, releaseAccountDevice } from "./firebase";
import App, { TopnotcherBrand, PublicSharedStudy } from "./App";

export default function AuthGate() {
  const shareToken = typeof window !== "undefined" && window.location.hash.startsWith("#share=") ? decodeURIComponent(window.location.hash.slice(7)) : "";
  const [user, setUser] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState("idle");
  const [deviceError, setDeviceError] = useState("");
  const deniedRef = useRef(false);

  useEffect(() => {
    if (shareToken) return;
    if (!firebaseConfigured) { setUser(null); return; }
    let active = true;
    finishGoogleRedirect().catch((err) => active && setError(authError(err)));
    const unsubscribe = watchAuth((nextUser) => {
      if (!active) return;
      const signedInUser = nextUser || null;
      if (signedInUser && !isAuthorizedGoogleUser(signedInUser)) {
        deniedRef.current = true;
        setAccessDenied(signedInUser);
        setUser(null);
        signOutGoogle().catch(() => {});
        return;
      }
      if (!signedInUser && deniedRef.current) {
        setUser(null);
        setDeviceStatus("idle");
        return;
      }
      deniedRef.current = false;
      setAccessDenied(null);
      setUser(signedInUser);
      if (!signedInUser) {
        setDeviceStatus("idle");
        return;
      }
      setDeviceStatus("checking");
      setDeviceError("");
      registerAccountDevice(signedInUser.uid).then(result => {
        if (!active) return;
        if (result?.ok) {
          setDeviceStatus("allowed");
          if (result?.verificationPending) console.warn("TOPNOTCHER entered with device registration pending.", result.verificationError);
        } else if (result?.reason === "limit") {
          setDeviceStatus("limit");
        } else {
          setDeviceStatus("error");
          setDeviceError("TOPNOTCHER could not verify this new device. Please check your internet connection and try again.");
        }
      });
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  const login = async () => {
    setBusy(true); setError("");
    try { await signInWithGoogle(); }
    catch (err) { setError(authError(err)); }
    finally { setBusy(false); }
  };

  if (shareToken) return <PublicSharedStudy token={shareToken} />;
  if (user === undefined) return <AuthLoading />;
  if (!firebaseConfigured) return <AuthConfigMissing />;
  if (accessDenied) return <AccessDeniedScreen user={accessDenied} onSignOut={() => { deniedRef.current = false; setAccessDenied(null); signOutGoogle().catch(() => {}); }} />;
  if (!user) return <SignInScreen busy={busy} error={error} onLogin={login} />;
  if (deviceStatus === "checking" || deviceStatus === "idle") return <DeviceAccessScreen status="checking" email={user.email} />;
  if (deviceStatus === "limit" || deviceStatus === "error") return <DeviceAccessScreen status={deviceStatus} error={deviceError} email={user.email} onRetry={() => { setDeviceStatus("checking"); setDeviceError(""); registerAccountDevice(user.uid).then(result => { if (result?.ok) setDeviceStatus("allowed"); else if (result?.reason === "limit") setDeviceStatus("limit"); else { setDeviceStatus("error"); setDeviceError("TOPNOTCHER could not verify this new device. Please check your internet connection and try again."); } }); }} onSignOut={async () => { await releaseAccountDevice(user.uid); await signOutGoogle(); }} />;
  return <AuthenticatedApp user={user} onSignOut={async () => { await releaseAccountDevice(user.uid); await signOutGoogle(); }} />;
}

function AuthenticatedApp({ user, onSignOut }) {
  // App is rendered only after Firebase has confirmed an authenticated user.
  return <App authUser={user} onSignOut={onSignOut} />;
}

function DeviceAccessScreen({ status, error, email, onRetry, onSignOut }) {
  const checking = status === "checking";
  const limit = status === "limit";
  return <div className="device-access-screen"><div className="device-access-card"><TopnotcherBrand/><div className={"device-access-icon "+(limit?"limit":"")}><ShieldCheck size={28}/></div><h1>{checking ? "Checking this device…" : limit ? "2-device limit reached" : "Device verification failed"}</h1><p>{checking ? "Please wait while TOPNOTCHER verifies your account and prepares your synchronized study data." : limit ? `This account is already signed in on 2 devices. ${email ? "Sign out of TOPNOTCHER on one of those devices, then try again here." : "Sign out of one device, then try again here."}` : (error || "Please try again.")}</p>{limit&&<p className="device-access-small">Your structured account data is synchronized through your TOPNOTCHER account and is available on the two authorized devices.</p>}<div className="device-access-actions">{!checking&&<button className="primary-btn" onClick={onRetry}>Try Again</button>}{onSignOut&&<button className="secondary-btn" onClick={onSignOut}>Sign out</button>}</div></div></div>;
}

function AuthLoading() {
  return <div className="auth-screen"><div className="auth-card auth-loading"><Loader2 className="spin" size={28}/><span>Checking your TOPNOTCHER! account…</span></div></div>;
}

function AuthConfigMissing() {
  return <div className="auth-screen"><div className="auth-card"><TopnotcherBrand/><div className="auth-icon"><ShieldCheck size={28}/></div><h1>Google Sign-In Setup Required</h1><p>Add the Firebase <b>VITE_FIREBASE_*</b> environment variables to your Vercel project and local <code>.env.local</code>, then redeploy.</p><p className="auth-small">Required: API key, Auth Domain, Project ID, Storage Bucket, Messaging Sender ID, and App ID.</p></div></div>;
}

function AccessDeniedScreen({ user, onSignOut }) {
  return <div className="auth-screen"><div className="auth-card auth-denied"><TopnotcherBrand/><div className="auth-icon"><ShieldCheck size={28}/></div><h1>Account Not Authorized</h1><p>The Google account <b>{user?.email || "this account"}</b> is not on the TOPNOTCHER! authorized-account list.</p><p className="auth-small">Only accounts explicitly authorized by the administrator can access the application.</p><p className="auth-small">Authorized accounts: {authorizedAccountDescription()}</p><button className="google-signin-btn" onClick={onSignOut}>Sign out</button></div></div>;
}

function SignInScreen({ busy, error, onLogin }) {
  return <div className="auth-screen"><div className="auth-card auth-signin"><TopnotcherBrand/><div className="auth-divider"/><h1>Welcome back, Topnotcher!</h1><p>Sign in with Google to access your LET review dashboard, study decks, drills, mock exams, and schedule.</p><button className="google-signin-btn" disabled={busy} onClick={onLogin}>{busy ? <Loader2 className="spin" size={20}/> : <Chrome size={20}/>}<span>{busy ? "Signing in…" : "Continue with Google"}</span></button>{error && <div className="auth-error">{error}</div>}<small>Your account stays signed in after refresh or reopening until you choose Sign out.</small></div></div>;
}

function authError(error) {
  const code = error?.code || "";
  const map = {
    "auth/popup-closed-by-user": "The Google sign-in window was closed. Please try again.",
    "auth/popup-blocked": "Your browser blocked the sign-in popup. Please allow popups for this site and try again.",
    "auth/cancelled-popup-request": "Another Google sign-in request is already open.",
    "auth/unauthorized-domain": "This site is not authorized in Firebase Authentication. Add your Vercel domain to Firebase Authorized Domains.",
    "auth/network-request-failed": "Network connection failed. Check your connection and try again."
  };
  return map[code] || error?.message || "Google sign-in failed. Please try again.";
}
