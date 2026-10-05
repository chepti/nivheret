import { createSeed } from "../data/seed";
import type { AppData, BadgeDef, Capability, Lesson, Meeting, Session, Tool } from "./types";

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
  let stripped = false;
  for (const chunk of EXTRA_DESCRIPTION_CHUNKS) {
    if (!next.includes(chunk)) continue;
    next = next.split(chunk).join("");
    stripped = true;
  }
  return stripped ? tidyDescription(next) : next;
}

export function dropUnwantedContent<T extends Pick<AppData, "capabilities" | "lessons"> & Partial<Pick<AppData, "meetings" | "badges" | "settings" | "tools">>>(data: T): T {
  const capabilities = (data.capabilities ?? [])
    .filter((c) => !isDroppedCapability(c.id, c.title))
    .map((c) => {
      const description = sanitizeCapabilityDescription(c.description);
      return description === c.description ? c : { ...c, description };
    });
  const keep = new Set(capabilities.map((c) => c.id));
  const lessons = (data.lessons ?? []).filter((l) => keep.has(l.capabilityId));
  return { ...data, capabilities, lessons };
}

/** שיעור/יכולת מקומיים גוברים על אותו מזהה בענן — בלי למחוק תמונה שכבר יש. */
export function keepImage<T extends { image?: string }>(preferred: T, fallback?: T): T {
  if (preferred.image === "") return preferred;
  if (preferred.image || !fallback?.image) return preferred;
  return { ...preferred, image: fallback.image };
}

function bodyKey(item: { image?: string }): string {
  const copy = { ...item };
  delete copy.image;
  return JSON.stringify(copy);
}

let seedCache: AppData | null = null;
function seedDrafts(): AppData {
  seedCache ??= createSeed();
  return seedCache;
}

/** טיוטת הזרע לא דורסת עריכה שכבר בענן. עריכה מפורשת של אותו מזהה כן נשמרת. */
export function unionById<T extends { id: string; image?: string }>(preferred: T[] = [], fallback: T[] = [], drafts: T[] = []): T[] {
  const seed = new Map(drafts.map((d) => [d.id, bodyKey(d)]));
  const map = new Map<string, T>();
  for (const item of fallback) map.set(item.id, item);
  for (const item of preferred) {
    const prev = map.get(item.id);
    const fp = seed.get(item.id);
    if (prev && fp && bodyKey(item) === fp && bodyKey(prev) !== fp) {
      map.set(item.id, keepImage(prev, item));
      continue;
    }
    map.set(item.id, keepImage(item, prev));
  }
  return [...map.values()];
}

export function unionLessons(local: Lesson[] = [], remote: Lesson[] = []): Lesson[] {
  return unionById(local, remote, seedDrafts().lessons);
}

export function unionCapabilities(local: Capability[] = [], remote: Capability[] = []): Capability[] {
  return unionById(local, remote, seedDrafts().capabilities);
}

export function unionTools(local: Tool[] = [], remote: Tool[] = []): Tool[] {
  return unionById(local, remote, seedDrafts().tools);
}

export function unionBadges(local: BadgeDef[] = [], remote: BadgeDef[] = []): BadgeDef[] {
  return unionById(local, remote, seedDrafts().badges);
}

export function unionMeetings(local: Meeting[] = [], remote: Meeting[] = []): Meeting[] {
  return unionById(local, remote, seedDrafts().meetings);
}

export function normalizeContent<T extends Pick<AppData, "capabilities" | "lessons"> & Partial<Pick<AppData, "meetings" | "badges" | "settings" | "tools">>>(data: T): T {
  return dropUnwantedContent(data);
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
    tools: saved.tools?.length ? saved.tools : seed.tools,
    capabilities: saved.capabilities ?? [],
    lessons: saved.lessons ?? [],
    responses: saved.responses ?? [],
    reactions: saved.reactions ?? [],
    meetings: saved.meetings ?? seed.meetings,
    rsvps: saved.rsvps ?? [],
    pairs: saved.pairs ?? [],
    wishes: saved.wishes ?? [],
    badges: saved.badges?.length ? saved.badges : seed.badges,
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
