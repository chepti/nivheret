import { createSeed } from "../data/seed";
import type { AppData, Lesson, Session } from "./types";

const DATA_KEY = "nivheret-data-v1";
const SESSION_KEY = "nivheret-session-v1";

export function unionById<T extends { id: string }>(preferred: T[] | undefined, extra: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of extra) map.set(item.id, item);
  for (const item of preferred ?? []) map.set(item.id, item);
  return [...map.values()];
}

export function mergeLessons(preferred: Lesson[] | undefined, seed: Lesson[]): Lesson[] {
  const remote = new Map((preferred ?? []).map((l) => [l.id, l]));
  const out = new Map<string, Lesson>();
  for (const extra of seed) {
    const cur = remote.get(extra.id);
    if (!cur) {
      out.set(extra.id, extra);
      continue;
    }
    const staleVideo = !cur.videoUrl || cur.videoUrl.includes("IhoKLbmpr4A");
    const sameVideo = staleVideo || cur.videoUrl === extra.videoUrl;
    const plainBody = !/<[a-z][\s\S]*>/i.test(cur.body);
    out.set(extra.id, {
      ...extra,
      ...cur,
      videoUrl: staleVideo ? extra.videoUrl : cur.videoUrl,
      chapters: cur.chapters?.length ? cur.chapters : sameVideo ? extra.chapters : cur.chapters,
      body: plainBody && extra.body ? extra.body : cur.body,
      title: cur.title === "שיעור חדש" ? extra.title : cur.title,
    });
    remote.delete(extra.id);
  }
  for (const leftover of remote.values()) out.set(leftover.id, leftover);
  return [...out.values()];
}

function mergeSeed(saved: AppData | null): AppData {
  const seed = createSeed();
  if (!saved) return seed;
  return {
    ...seed,
    ...saved,
    institutions: saved.institutions?.length ? saved.institutions : seed.institutions,
    teachers: saved.teachers?.length ? saved.teachers : seed.teachers,
    periods: saved.periods?.length ? saved.periods : seed.periods,
    tools: unionById(saved.tools, seed.tools),
    capabilities: unionById(saved.capabilities, seed.capabilities),
    lessons: mergeLessons(saved.lessons, seed.lessons),
    responses: saved.responses ?? [],
    reactions: saved.reactions ?? [],
    meetings: saved.meetings ?? seed.meetings,
    rsvps: saved.rsvps ?? [],
    pairs: saved.pairs ?? [],
    badges: saved.badges?.length ? saved.badges : seed.badges,
    settings: { ...seed.settings, ...saved.settings },
  };
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
