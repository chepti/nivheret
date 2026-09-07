import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import sharp from "sharp";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);

const PHRASES = [
  ["מה בודקות לפני", "מה בודקים לפני"],
  ["לפני שמקרינות — מה בודקות", "לפני שמקרינים — מה בודקים"],
  ["מה מגדירות", "מה מגדירים"],
  ["מה כותבות", "מה כותבים"],
  ["מה עושות", "מה עושים"],
  ["איך משתפות", "איך משתפים"],
  ["מתי לא משתמשות", "מתי לא משתמשים"],
  ["בודקות בעצמכן", "בודקים בעצמכם"],
  ["החומר שצירפתן", "החומר שצירפתם"],
  ["מקורות שלכן", "מקורות שלכם"],
  ["שולחת אליכן", "שולחת אליכם"],
  ["נכנסות ל־", "נכנסים ל־"],
  ["נכנסות עם", "נכנסים עם"],
  ["למתחילות", "למתחילים"],
  ["מוכנה ללמד", "מוכן ללמד"],
  ["ראשונה בשער", "ראשון בשער"],
];

const WORDS = [
  ["לוחצות", "לוחצים"],
  ["בוחרות", "בוחרים"],
  ["נותנות", "נותנים"],
  ["מאשרות", "מאשרים"],
  ["מצרפות", "מצרפים"],
  ["כותבות", "כותבים"],
  ["קובעות", "קובעים"],
  ["עוברות", "עוברים"],
  ["מפרסמות", "מפרסמים"],
  ["מוחקות", "מוחקים"],
  ["מגדירות", "מגדירים"],
  ["פותחות", "פותחים"],
  ["מוסיפות", "מוסיפים"],
  ["מסננות", "מסננים"],
  ["מתייגות", "מתייגים"],
  ["מבקשות", "מבקשים"],
  ["מתקנות", "מתקנים"],
  ["מעצבות", "מעצבים"],
  ["חוזרות", "חוזרים"],
  ["ממציאות", "ממציאים"],
  ["משאירות", "משאירים"],
  ["בודקות", "בודקים"],
  ["מציגות", "מציגים"],
  ["מקרינות", "מקרינים"],
  ["משתפות", "משתפים"],
  ["בונות", "בונים"],
  ["שומרות", "שומרים"],
  ["חותכות", "חותכים"],
  ["משתמשות", "משתמשים"],
  ["מעלות", "מעלים"],
  ["שולטות", "שולטים"],
  ["שולטת", "שולט"],
  ["מלמדת", "מלמד"],
  ["לומדת", "לומד"],
  ["מומחית", "מומחה"],
  ["מיישמת", "מיישם"],
  ["סקרנית", "סקרן"],
  ["מוזמנות", "מוזמנים"],
];

function voice(text) {
  if (!text) return text;
  let next = text;
  for (const [from, to] of PHRASES) next = next.split(from).join(to);
  for (const [from, to] of WORDS) next = next.split(from).join(to);
  return next;
}

function voiceDeep(value) {
  if (typeof value === "string") return voice(value);
  if (Array.isArray(value)) return value.map(voiceDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, k === "image" || k === "videoUrl" || k.endsWith("At") || k === "id" || k === "icon" ? v : voiceDeep(v)]));
  }
  return value;
}

function storagePathFromUrl(url) {
  try {
    const u = new URL(url);
    const encoded = u.pathname.split("/o/")[1];
    return encoded ? decodeURIComponent(encoded) : "";
  } catch {
    return "";
  }
}

async function compressBuffer(buf, { square, max, keepPng }) {
  const img = sharp(buf);
  const meta = await img.metadata();
  const w = meta.width ?? max;
  const h = meta.height ?? max;
  let pipeline = img;
  if (square) {
    const side = Math.min(w, h);
    pipeline = pipeline.extract({
      left: Math.floor((w - side) / 2),
      top: Math.floor((h - side) / 2),
      width: side,
      height: side,
    }).resize(Math.min(max, side), Math.min(max, side));
  } else {
    pipeline = pipeline.resize(max, max, { fit: "inside", withoutEnlargement: true });
  }
  if (keepPng && meta.hasAlpha) {
    const out = await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer();
    return { buf: out, type: "image/png", ext: "png" };
  }
  const out = await pipeline.flatten({ background: "#fff6df" }).jpeg({ quality: 55, mozjpeg: true }).toBuffer();
  return { buf: out, type: "image/jpeg", ext: "jpg" };
}

async function shrinkUrl(storage, url, folder, id, opts) {
  if (!url || url.startsWith("data:")) return url;
  const res = await fetch(url);
  if (!res.ok) {
    console.log("skip download", id, res.status);
    return url;
  }
  const raw = Buffer.from(await res.arrayBuffer());
  const before = raw.length;
  const shrunk = await compressBuffer(raw, opts);
  if (shrunk.buf.length >= before && storagePathFromUrl(url).endsWith(`.${shrunk.ext}`)) {
    console.log("keep", folder, id, before);
    return url;
  }
  const fileRef = ref(storage, `cms/${folder}/${id}.${shrunk.ext}`);
  await uploadBytes(fileRef, shrunk.buf, { contentType: shrunk.type });
  const next = await getDownloadURL(fileRef);
  console.log("ok", folder, id, before, "→", shrunk.buf.length);
  return next;
}

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

const snap = await getDoc(doc(db, "content", "app"));
if (!snap.exists()) {
  console.error("אין מסמך content/app");
  process.exit(1);
}
const data = snap.data();
const next = voiceDeep(data);

next.tools = await Promise.all(
  (next.tools ?? []).map(async (t) =>
    t.image ? { ...t, image: await shrinkUrl(storage, t.image, "tools", t.id, { square: true, max: 144, keepPng: false }) } : t,
  ),
);
next.capabilities = await Promise.all(
  (next.capabilities ?? []).map(async (c) =>
    c.image ? { ...c, image: await shrinkUrl(storage, c.image, "capabilities", c.id, { square: true, max: 144, keepPng: false }) } : c,
  ),
);
next.badges = await Promise.all(
  (next.badges ?? []).map(async (b) =>
    b.image ? { ...b, image: await shrinkUrl(storage, b.image, "badges", b.id, { square: true, max: 160, keepPng: true }) } : b,
  ),
);

const fresh = (await getDoc(doc(db, "content", "app"))).data() ?? data;
function keep(a = [], b = []) {
  const map = new Map(b.map((x) => [x.id, x]));
  return a.map((x) => (x.image || !map.get(x.id)?.image ? x : { ...x, image: map.get(x.id).image }));
}
next.tools = keep(next.tools, fresh.tools);
next.capabilities = keep(next.capabilities, fresh.capabilities);
next.badges = keep(next.badges, fresh.badges);

next.settings = {
  ...(next.settings ?? {}),
  contentUpdatedAt: new Date().toISOString(),
};

await setDoc(doc(db, "content", "app"), JSON.parse(JSON.stringify(next)));
console.log("עודכן content/app", {
  tools: next.tools?.length,
  caps: next.capabilities?.length,
  lessons: next.lessons?.length,
  badges: next.badges?.length,
});
process.exit(0);
