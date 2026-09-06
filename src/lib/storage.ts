import { createSeed } from "../data/seed";
import type { AppData, Session } from "./types";

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

const DROPPED_LESSON_IDS = new Set([
  "lesson-class-open",
  "lesson-class-invite",
  "lesson-class-year",
  "lesson-class-topics",
  "lesson-class-assign",
  "lesson-class-feedback",
  "lesson-class-share",
  "lesson-class-materials",
  "lesson-class-progress",
  "lesson-class-quiz",
  "lesson-gem-companion",
  "lesson-gem-skeptic",
  "lesson-gem-images",
  "lesson-nb-sources",
  "lesson-nb-slides",
  "lesson-nb-assess",
  "lesson-canvas-game",
  "lesson-canvas-lomda",
  "lesson-gemini-start",
  "lesson-gemini-notebook",
  "lesson-gemini-work",
  "lesson-gemini-async",
  "lesson-gemini-vids",
  "lesson-forms-ai",
  "lesson-forms-export",
  "lesson-drive-folders",
  "lesson-drive-share",
  "lesson-meet-share",
  "lesson-meet-beyond",
]);

export function dropUnwantedContent<T extends Pick<AppData, "capabilities" | "lessons">>(data: T): T {
  const capabilities = (data.capabilities ?? []).filter((c) => !DROPPED_CAP_IDS.has(c.id));
  const keep = new Set(capabilities.map((c) => c.id));
  const lessons = (data.lessons ?? []).filter(
    (l) => keep.has(l.capabilityId) && !DROPPED_CAP_IDS.has(l.capabilityId) && !DROPPED_LESSON_IDS.has(l.id),
  );
  return { ...data, capabilities, lessons };
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
    lessons: saved.lessons?.length ? saved.lessons : seed.lessons,
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
