import React, { useEffect, useRef, useState } from "react";
import { Chrome, Loader2, ShieldCheck } from "lucide-react";
import { firebaseConfigured, finishGoogleRedirect, signInWithGoogle, signOutGoogle, watchAuth, isAuthorizedGoogleUser, authorizedAccountDescription } from "./firebase";
import App, { TopnotcherBrand } from "./App";

export default function AuthGate() {
  const [user, setUser] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(null);
  const deniedRef = useRef(false);

  useEffect(() => {
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
        return;
      }
      deniedRef.current = false;
      setAccessDenied(null);
      setUser(signedInUser);
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  const login = async () => {
    setBusy(true); setError("");
    try { await signInWithGoogle(); }
    catch (err) { setError(authError(err)); }
    finally { setBusy(false); }
  };

  if (user === undefined) return <AuthLoading />;
  if (!firebaseConfigured) return <AuthConfigMissing />;
  if (accessDenied) return <AccessDeniedScreen user={accessDenied} onSignOut={() => { deniedRef.current = false; setAccessDenied(null); signOutGoogle().catch(() => {}); }} />;
  if (!user) return <SignInScreen busy={busy} error={error} onLogin={login} />;
  return <AuthenticatedApp user={user} onSignOut={signOutGoogle} />;
}

function AuthenticatedApp({ user, onSignOut }) {
  // App is rendered only after Firebase has confirmed an authenticated user.
  return <App authUser={user} onSignOut={onSignOut} />;
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
