import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebase } from "./firebase";

function shrinkDataUrl(dataUrl: string, maxEdge: number, asPng: boolean): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      if (!asPng) {
        ctx.fillStyle = "#fffdf7";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(asPng ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.62));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, raw] = dataUrl.split(",");
  const mime = meta.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
  const bytes = atob(raw ?? "");
  const buf = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) buf[i] = bytes.charCodeAt(i);
  return new Blob([buf], { type: mime });
}

export async function prepareLessonImage(file: File): Promise<string> {
  const asPng = file.type === "image/png" || file.type === "image/webp";
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("קריאת התמונה נכשלה"));
    reader.readAsDataURL(file);
  });
  return shrinkDataUrl(raw, 800, asPng);
}

export async function uploadLessonImage(lessonId: string, dataUrl: string): Promise<string> {
  if (!dataUrl.startsWith("data:image")) return dataUrl;
  const fb = getFirebase();
  if (!fb) return dataUrl;
  const blob = dataUrlToBlob(dataUrl);
  const ext = blob.type.includes("png") ? "png" : "jpg";
  const fileRef = ref(fb.storage, `lessons/${lessonId}/${Date.now()}.${ext}`);
  await uploadBytes(fileRef, blob, { contentType: blob.type });
  return getDownloadURL(fileRef);
}

export async function uploadCmsImage(folder: string, id: string, dataUrl: string): Promise<string> {
  if (!dataUrl.startsWith("data:image")) return dataUrl;
  const fb = getFirebase();
  if (!fb) return dataUrl;
  const blob = dataUrlToBlob(dataUrl);
  const ext = blob.type.includes("png") ? "png" : "jpg";
  const fileRef = ref(fb.storage, `cms/${folder}/${id}.${ext}`);
  await uploadBytes(fileRef, blob, { contentType: blob.type });
  return getDownloadURL(fileRef);
}

export async function materializeContentImages<T extends {
  tools?: { id: string; image?: string }[];
  capabilities?: { id: string; image?: string }[];
  badges?: { id: string; image?: string }[];
}>(data: T): Promise<T> {
  const tools = await Promise.all(
    (data.tools ?? []).map(async (t) =>
      t.image?.startsWith("data:image") ? { ...t, image: await uploadCmsImage("tools", t.id, t.image) } : t,
    ),
  );
  const capabilities = await Promise.all(
    (data.capabilities ?? []).map(async (c) =>
      c.image?.startsWith("data:image") ? { ...c, image: await uploadCmsImage("capabilities", c.id, c.image) } : c,
    ),
  );
  const badges = await Promise.all(
    (data.badges ?? []).map(async (b) =>
      b.image?.startsWith("data:image") ? { ...b, image: await uploadCmsImage("badges", b.id, b.image) } : b,
    ),
  );
  return { ...data, tools, capabilities, badges };
}
