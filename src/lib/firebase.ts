import { initializeApp, type FirebaseApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut, type Auth } from "firebase/auth";
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

export async function signInWithGoogle(): Promise<string | null> {
  const fb = getFirebase();
  if (!fb) return null;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account", hd: "tzviama.com" });
  const cred = await signInWithPopup(fb.auth, provider);
  return cred.user.email?.toLowerCase() ?? null;
}

export async function signOutGoogle(): Promise<void> {
  const fb = getFirebase();
  if (fb) await signOut(fb.auth);
}
