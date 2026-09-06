import { createSeed } from "../data/seed";
import type { AppData, Lesson, Session } from "./types";

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

export function dropUnwantedContent<T extends Pick<AppData, "capabilities" | "lessons">>(data: T): T {
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

/** שיעור מקומי גובר על אותו מזהה בענן — כדי לא למחוק עריכה. */
export function unionLessons(local: Lesson[] = [], remote: Lesson[] = []): Lesson[] {
  const map = new Map<string, Lesson>();
  for (const lesson of remote) map.set(lesson.id, lesson);
  for (const lesson of local) map.set(lesson.id, lesson);
  return [...map.values()];
}

/** מוסיפים טיוטה רק ליכולת שעדיין אין לה שיעור, בלי לדרוס קיים. */
export function fillMissingLessons(existing: Lesson[], drafts: Lesson[]): Lesson[] {
  const haveCap = new Set(existing.map((l) => l.capabilityId));
  const haveId = new Set(existing.map((l) => l.id));
  return [...existing, ...drafts.filter((d) => !haveId.has(d.id) && !haveCap.has(d.capabilityId))];
}

export function normalizeContent<T extends Pick<AppData, "capabilities" | "lessons">>(data: T): T {
  const cleaned = dropUnwantedContent(data);
  return { ...cleaned, lessons: fillMissingLessons(cleaned.lessons, createSeed().lessons) };
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
    capabilities: saved.capabilities?.length ? saved.capabilities : seed.capabilities,
    lessons: fillMissingLessons(saved.lessons ?? [], seed.lessons),
    responses: saved.responses ?? [],
    reactions: saved.reactions ?? [],
    meetings: saved.meetings ?? seed.meetings,
    rsvps: saved.rsvps ?? [],
    pairs: saved.pairs ?? [],
    badges: saved.badges?.length ? saved.badges : seed.badges,
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
