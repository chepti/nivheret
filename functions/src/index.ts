/**
 * Cloud Functions לכתיבת טופס בזיהוי קל ולצבירת דשבורד.
 * נפרסים אחרי יצירת פרויקט Firebase:
 *   cd functions && npm i && firebase deploy --only functions
 */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

initializeApp();

export const writeFormResponse = onCall(async (request) => {
  const email = String(request.data?.email ?? "").toLowerCase();
  const capabilityId = String(request.data?.capabilityId ?? "");
  if (!email.endsWith("@tzviama.com") && email !== "chepti@gmail.com") {
    throw new HttpsError("permission-denied", "מייל לא מורשה");
  }
  if (!capabilityId) throw new HttpsError("invalid-argument", "חסר capabilityId");
  const db = getFirestore();
  const teacher = await db.collection("teachers").doc(email).get();
  if (!teacher.exists) throw new HttpsError("not-found", "המורה לא בספר");
  const id = `${email}_${capabilityId}`;
  await db.collection("responses").doc(id).set(
    { ...request.data, teacherId: email, capabilityId, updatedAt: new Date().toISOString() },
    { merge: true },
  );
  return { ok: true };
});
