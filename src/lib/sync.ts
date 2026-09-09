import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { getFirebase } from "./firebase";
import { materializeContentImages } from "./media";
import { unionBadges, unionCapabilities, unionLessons, unionTools } from "./storage";
import type {
  AppData,
  CapabilityResponse,
  LearningPair,
  MeetingRsvp,
  Reaction,
  Teacher,
  TopicWish,
} from "./types";

export type ContentDoc = Omit<AppData, "teachers" | "responses" | "reactions" | "rsvps" | "pairs" | "wishes">;

function teacherDocId(email: string): string {
  return email.toLowerCase();
}

function pairId(teacherId: string, second: string): string {
  return `${teacherId.toLowerCase()}__${second}`;
}

export async function pullRemote(): Promise<Partial<AppData> | null> {
  const fb = getFirebase();
  if (!fb) return null;
  const contentSnap = await getDoc(doc(fb.db, "content", "app"));
  const [teachersSnap, responsesSnap, rsvpsSnap, reactionsSnap, pairsSnap, wishesSnap] = await Promise.all([
    getDocs(collection(fb.db, "teachers")),
    getDocs(collection(fb.db, "responses")),
    getDocs(collection(fb.db, "rsvps")),
    getDocs(collection(fb.db, "reactions")),
    getDocs(collection(fb.db, "pairs")),
    getDocs(collection(fb.db, "wishes")),
  ]);
  const remote: Partial<AppData> = {
    teachers: teachersSnap.docs.map((d) => d.data() as Teacher),
    responses: responsesSnap.docs.map((d) => d.data() as CapabilityResponse),
    rsvps: rsvpsSnap.docs.map((d) => d.data() as MeetingRsvp),
    reactions: reactionsSnap.docs.map((d) => d.data() as Reaction),
    pairs: pairsSnap.docs.map((d) => d.data() as LearningPair),
    wishes: wishesSnap.docs.map((d) => d.data() as TopicWish),
  };
  if (contentSnap.exists()) Object.assign(remote, contentSnap.data() as ContentDoc);
  return remote;
}

export async function seedIfEmpty(data: AppData): Promise<boolean> {
  const fb = getFirebase();
  if (!fb) return false;
  const [contentSnap, teachersSnap] = await Promise.all([
    getDoc(doc(fb.db, "content", "app")),
    getDocs(collection(fb.db, "teachers")),
  ]);
  if (contentSnap.exists() && teachersSnap.size > 0) return false;
  if (teachersSnap.size === 0) {
    const chunk = 400;
    for (let i = 0; i < data.teachers.length; i += chunk) {
      const batch = writeBatch(fb.db);
      for (const t of data.teachers.slice(i, i + chunk)) {
        batch.set(doc(fb.db, "teachers", teacherDocId(t.email)), t);
      }
      await batch.commit();
    }
  }
  if (!contentSnap.exists()) {
    await setDoc(doc(fb.db, "content", "app"), contentFrom(data));
  }
  return true;
}

export async function pushContent(data: AppData): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  const prepared = await materializeContentImages(data);
  const snap = await getDoc(doc(fb.db, "content", "app"));
  const remote = snap.exists() ? (snap.data() as ContentDoc) : null;
  await setDoc(doc(fb.db, "content", "app"), {
    ...contentFrom(prepared),
    capabilities: unionCapabilities(prepared.capabilities, remote?.capabilities ?? []),
    lessons: unionLessons(prepared.lessons, remote?.lessons ?? []),
    tools: unionTools(prepared.tools, remote?.tools ?? []),
    badges: unionBadges(prepared.badges, remote?.badges ?? []),
  });
}

export async function pushTeacher(teacher: Teacher): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  await setDoc(doc(fb.db, "teachers", teacherDocId(teacher.email)), teacher);
}

export async function deleteTeacher(teacher: Teacher): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  await deleteDoc(doc(fb.db, "teachers", teacherDocId(teacher.email)));
  if (teacher.id.toLowerCase() !== teacher.email.toLowerCase()) {
    await deleteDoc(doc(fb.db, "teachers", teacherDocId(teacher.id)));
  }
}

export async function pushResponse(row: CapabilityResponse): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  await setDoc(doc(fb.db, "responses", pairId(row.teacherId, row.capabilityId)), row);
}

export async function pushRsvp(row: MeetingRsvp): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  await setDoc(doc(fb.db, "rsvps", pairId(row.teacherId, row.meetingId)), row);
}

export async function pushReaction(row: Reaction): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  await setDoc(doc(fb.db, "reactions", pairId(row.teacherId, row.capabilityId)), row);
}

export async function pushPair(row: LearningPair): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  await setDoc(doc(fb.db, "pairs", row.id), row);
}

export async function pushWish(row: TopicWish): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  await setDoc(doc(fb.db, "wishes", row.id), row);
}

export async function deleteWish(id: string): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  await deleteDoc(doc(fb.db, "wishes", id));
}

export function watchShared(onChange: (part: Partial<AppData>) => void): () => void {
  const fb = getFirebase();
  if (!fb) return () => undefined;
  const unsub = [
    onSnapshot(doc(fb.db, "content", "app"), (snap) => {
      if (snap.exists()) onChange(snap.data() as ContentDoc);
    }),
    onSnapshot(collection(fb.db, "teachers"), (snap) => {
      if (snap.docs.length) onChange({ teachers: snap.docs.map((d) => d.data() as Teacher) });
    }),
    onSnapshot(collection(fb.db, "responses"), (snap) => {
      onChange({ responses: snap.docs.map((d) => d.data() as CapabilityResponse) });
    }),
    onSnapshot(collection(fb.db, "rsvps"), (snap) => {
      onChange({ rsvps: snap.docs.map((d) => d.data() as MeetingRsvp) });
    }),
    onSnapshot(collection(fb.db, "reactions"), (snap) => {
      onChange({ reactions: snap.docs.map((d) => d.data() as Reaction) });
    }),
    onSnapshot(collection(fb.db, "pairs"), (snap) => {
      onChange({ pairs: snap.docs.map((d) => d.data() as LearningPair) });
    }),
    onSnapshot(collection(fb.db, "wishes"), (snap) => {
      onChange({ wishes: snap.docs.map((d) => d.data() as TopicWish) });
    }),
  ];
  return () => unsub.forEach((fn) => fn());
}

function contentFrom(data: AppData): ContentDoc {
  return JSON.parse(JSON.stringify({
    institutions: data.institutions,
    periods: data.periods,
    tools: data.tools,
    capabilities: data.capabilities,
    lessons: data.lessons,
    meetings: data.meetings,
    badges: data.badges,
    settings: data.settings,
  })) as ContentDoc;
}
