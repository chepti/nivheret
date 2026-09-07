import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, listAll, ref } from "firebase/storage";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);
const storage = getStorage(app);

function fileId(name) {
  return name.replace(/\.(png|jpe?g|webp)$/i, "");
}

async function urlsIn(folder) {
  const listed = await listAll(ref(storage, `cms/${folder}`));
  const map = new Map();
  for (const item of listed.items) {
    const id = fileId(item.name);
    const url = await getDownloadURL(item);
    map.set(id, { name: item.name, url, full: item.fullPath });
    console.log(folder, item.name);
  }
  return map;
}

const snap = await getDoc(doc(db, "content", "app"));
if (!snap.exists()) {
  console.error("אין content/app");
  process.exit(1);
}
const data = snap.data();
console.log("--- Firestore badges ---");
for (const b of data.badges ?? []) {
  console.log(b.id, b.title, b.image ? `image ${String(b.image).slice(0, 80)}` : "NO IMAGE");
}
console.log("--- Storage cms/badges ---");
const badgeFiles = await urlsIn("badges");
console.log("--- Storage cms/tools ---");
await urlsIn("tools");
console.log("--- Storage cms/capabilities ---");
await urlsIn("capabilities");

const badges = (data.badges ?? []).map((b) => {
  if (b.image) return b;
  const found = badgeFiles.get(b.id);
  if (!found) return b;
  console.log("restore", b.id, found.name);
  return { ...b, image: found.url };
});

const restored = badges.filter((b) => b.image).length;
await setDoc(doc(db, "content", "app"), {
  ...data,
  badges,
  settings: { ...(data.settings ?? {}), contentUpdatedAt: new Date().toISOString() },
});
console.log("badges with image:", restored, "/", badges.length);
process.exit(0);
