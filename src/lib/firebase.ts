import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

export type FirebaseBundle = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
};

function readConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;
  if (!apiKey || !projectId) return null;
  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
}

let bundle: FirebaseBundle | null | undefined;

export function firebaseEnabled(): boolean {
  return readConfig() !== null;
}

export function getFirebase(): FirebaseBundle | null {
  if (bundle !== undefined) return bundle;
  const cfg = readConfig();
  if (!cfg) {
    bundle = null;
    return null;
  }
  const app = initializeApp(cfg);
  bundle = {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app),
  };
  return bundle;
}

function googleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  provider.addScope("email");
  provider.addScope("profile");
  return provider;
}

export function googleErrorMessage(err: unknown): string {
  const code = typeof err === "object" && err && "code" in err ? String((err as { code: string }).code) : "";
  if (code.includes("unauthorized-domain")) {
    return "הדומיין לא מורשה ב־Firebase. צריך להוסיף nivheret.web.app ו־localhost ברשימת Authorized domains.";
  }
  if (code.includes("popup-blocked")) return "הדפדפן חסם את חלון גוגל. נסו שוב, או תרשו חלונות קופצים.";
  if (code.includes("popup-closed")) return "חלון גוגל נסגר לפני סיום הכניסה. נסו שוב.";
  if (code.includes("network-request-failed")) return "אין חיבור יציב לגוגל. בדקו את הרשת ונסו שוב.";
  if (code.includes("operation-not-allowed")) return "כניסת גוגל עדיין לא הופעלה בפרויקט Firebase.";
  return "לא הצלחנו להתחבר לגוגל.";
}

export async function signInWithGoogle(): Promise<string | null> {
  const fb = getFirebase();
  if (!fb) return null;
  const provider = googleProvider();
  try {
    const cred = await signInWithPopup(fb.auth, provider);
    return cred.user.email?.toLowerCase() ?? null;
  } catch (err) {
    const code = typeof err === "object" && err && "code" in err ? String((err as { code: string }).code) : "";
    if (code.includes("popup-blocked") || code.includes("operation-not-supported")) {
      await signInWithRedirect(fb.auth, provider);
      return null;
    }
    throw err;
  }
}

export async function completeGoogleRedirect(): Promise<string | null> {
  const fb = getFirebase();
  if (!fb) return null;
  const cred = await getRedirectResult(fb.auth);
  return cred?.user.email?.toLowerCase() ?? null;
}

export async function signOutGoogle(): Promise<void> {
  const fb = getFirebase();
  if (fb) await signOut(fb.auth);
}
