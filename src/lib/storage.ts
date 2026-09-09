import { createSeed } from "../data/seed";
import type { AppData, BadgeDef, Capability, Lesson, Session, Tool } from "./types";
import { neutralizeTeacherVoice } from "./voice";

const DATA_KEY = "nivheret-data-v1";
const SESSION_KEY = "nivheret-session-v1";

/** פיצולים ישנים שכבר כלולים ביכולות שערכת — לא להחזיר אותם. */
const DROPPED_CAP_IDS = new Set([
  "cap-class-invite",
  "cap-class-topics",
  "cap-class-feedback",
  "cap-class-announce",
  "cap-class-share",
  "cap-class-progress",
  "cap-gemini-start",
  "cap-gemini-notebook",
  "cap-gemini-worksheets",
  "cap-gemini-async",
  "cap-gemini-vids",
  "cap-forms-ai",
  "cap-forms-export",
  "cap-drive-folders",
  "cap-drive-share",
  "cap-meet-share",
  "cap-meet-beyond",
]);

const DROPPED_TITLES = new Set([
  "הזמנת תלמידות",
  "ארגון בנושאים",
  "בדיקה ומשוב",
  "הודעה לכיתה",
  "שיתוף עם מורה עמיתה",
  "מעקב התקדמות",
]);

export function isDroppedCapability(id: string, title?: string): boolean {
  if (DROPPED_CAP_IDS.has(id)) return true;
  const t = (title ?? "").replace(/\s+/g, " ").trim();
  return DROPPED_TITLES.has(t);
}

/** משפטים שמוזגו בטעות ליכולות שנשארו — אחרי שהוסרו ככרטיסים נפרדים. */
const EXTRA_DESCRIPTION_CHUNKS = [
  "הזמנת תלמידות ומורים, לפרסם עדכון שכל התלמידות רואות.",
  "הזמנת תלמידות ומורים, לפרסם עדכון שכל התלמידות רואות",
  "הזמנת תלמידות ומורים",
  "לפרסם עדכון שכל התלמידות רואות.",
  "לפרסם עדכון שכל התלמידות רואות",
  "ארגון בנושאים",
  "לבדוק עבודה, להחזיר הערה ולתת ציון.",
  "לבדוק עבודה, להחזיר הערה ולתת ציון",
];

function tidyDescription(text: string): string {
  return text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([.])/g, "$1")
    .trim();
}

export function sanitizeCapabilityDescription(description: string): string {
  let next = description ?? "";
  for (const chunk of EXTRA_DESCRIPTION_CHUNKS) {
    next = next.split(chunk).join("");
  }
  return tidyDescription(next);
}

export function dropUnwantedContent<T extends Pick<AppData, "capabilities" | "lessons"> & Partial<Pick<AppData, "meetings" | "badges" | "settings" | "tools">>>(data: T): T {
  const capabilities = (data.capabilities ?? [])
    .filter((c) => !isDroppedCapability(c.id, c.title))
    .map((c) => {
      const description = neutralizeTeacherVoice(sanitizeCapabilityDescription(c.description));
      const title = neutralizeTeacherVoice(c.title);
      return title === c.title && description === c.description ? c : { ...c, title, description };
    });
  const keep = new Set(capabilities.map((c) => c.id));
  const lessons = (data.lessons ?? [])
    .filter((l) => keep.has(l.capabilityId))
    .map((l) => {
      const title = neutralizeTeacherVoice(l.title);
      const body = neutralizeTeacherVoice(l.body);
      const quiz = l.quiz.map((q) => ({
        ...q,
        prompt: neutralizeTeacherVoice(q.prompt),
        options: q.options.map((o) => neutralizeTeacherVoice(o)),
      }));
      return { ...l, title, body, quiz };
    });
  const meetings = data.meetings?.map((m) => ({
    ...m,
    title: neutralizeTeacherVoice(m.title),
    description: neutralizeTeacherVoice(m.description),
  }));
  const badges = data.badges?.map((b) => ({
    ...b,
    title: neutralizeTeacherVoice(b.title),
    description: neutralizeTeacherVoice(b.description),
  }));
  const tools = data.tools?.map((t) => ({
    ...t,
    name: neutralizeTeacherVoice(t.name),
    subtitle: neutralizeTeacherVoice(t.subtitle),
    description: neutralizeTeacherVoice(t.description),
  }));
  const settings = data.settings
    ? { ...data.settings, praiseNote: neutralizeTeacherVoice(data.settings.praiseNote) }
    : data.settings;
  return {
    ...data,
    capabilities,
    lessons,
    ...(meetings ? { meetings } : {}),
    ...(badges ? { badges } : {}),
    ...(tools ? { tools } : {}),
    ...(settings ? { settings } : {}),
  };
}

/** שיעור/יכולת מקומיים גוברים על אותו מזהה בענן — בלי למחוק תמונה שכבר יש. */
export function keepImage<T extends { image?: string }>(preferred: T, fallback?: T): T {
  if (preferred.image === "") return preferred;
  if (preferred.image || !fallback?.image) return preferred;
  return { ...preferred, image: fallback.image };
}

export function unionById<T extends { id: string; image?: string }>(preferred: T[] = [], fallback: T[] = []): T[] {
  const map = new Map<string, T>();
  for (const item of fallback) map.set(item.id, item);
  for (const item of preferred) map.set(item.id, keepImage(item, map.get(item.id)));
  return [...map.values()];
}

export function unionLessons(local: Lesson[] = [], remote: Lesson[] = []): Lesson[] {
  return unionById(local, remote);
}

export function unionCapabilities(local: Capability[] = [], remote: Capability[] = []): Capability[] {
  return unionById(local, remote);
}

export function unionTools(local: Tool[] = [], remote: Tool[] = []): Tool[] {
  return unionById(local, remote);
}

export function unionBadges(local: BadgeDef[] = [], remote: BadgeDef[] = []): BadgeDef[] {
  return unionById(local, remote);
}

/** אם לכלי אין אף יכולת — מוסיפים את טיוטות הזרע שלו, בלי לדרוס מה שכבר יש. */
export function fillMissingCaps(existing: Capability[], drafts: Capability[]): Capability[] {
  const haveId = new Set(existing.map((c) => c.id));
  const toolsWith = new Set(existing.map((c) => c.toolId));
  return [...existing, ...drafts.filter((d) => !haveId.has(d.id) && !toolsWith.has(d.toolId))];
}

/** מוסיפים טיוטה רק ליכולת שעדיין אין לה שיעור, בלי לדרוס קיים. */
export function fillMissingLessons(existing: Lesson[], drafts: Lesson[]): Lesson[] {
  const haveCap = new Set(existing.map((l) => l.capabilityId));
  const haveId = new Set(existing.map((l) => l.id));
  return [...existing, ...drafts.filter((d) => !haveId.has(d.id) && !haveCap.has(d.capabilityId))];
}

export function normalizeContent<T extends Pick<AppData, "capabilities" | "lessons"> & Partial<Pick<AppData, "meetings" | "badges" | "settings" | "tools">>>(data: T): T {
  const cleaned = dropUnwantedContent(data);
  const seed = createSeed();
  const capabilities = fillMissingCaps(cleaned.capabilities, seed.capabilities);
  return {
    ...cleaned,
    capabilities,
    lessons: fillMissingLessons(cleaned.lessons, seed.lessons),
  };
}

function mergeSeed(saved: AppData | null): AppData {
  const seed = createSeed();
  if (!saved) return seed;
  return dropUnwantedContent({
    ...seed,
    ...saved,
    institutions: saved.institutions?.length ? saved.institutions : seed.institutions,
    teachers: saved.teachers?.length ? saved.teachers : seed.teachers,
    periods: saved.periods?.length ? saved.periods : seed.periods,
    tools: saved.tools?.length ? unionTools(saved.tools, seed.tools) : seed.tools,
    capabilities: fillMissingCaps(saved.capabilities ?? [], seed.capabilities),
    lessons: fillMissingLessons(saved.lessons ?? [], seed.lessons),
    responses: saved.responses ?? [],
    reactions: saved.reactions ?? [],
    meetings: saved.meetings ?? seed.meetings,
    rsvps: saved.rsvps ?? [],
    pairs: saved.pairs ?? [],
    wishes: saved.wishes ?? [],
    badges: saved.badges?.length ? unionBadges(saved.badges, seed.badges) : seed.badges,
    classrooms: saved.classrooms ?? seed.classrooms ?? [],
    subjects: saved.subjects ?? seed.subjects ?? [],
    settings: { ...seed.settings, ...saved.settings },
  });
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    return mergeSeed(raw ? (JSON.parse(raw) as AppData) : null);
  } catch {
    return createSeed();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null): void {
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
