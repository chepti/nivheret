import { primaryStatus } from "./status";
import type { AppData, SchoolClass, Teacher } from "./types";

/** ניחוש שכבה רק כשהשם נראה כמו כיתה+מקבילה (ז1, יא-3). מילים כמו «פנימייה» לא נחתכות. */
export function guessLayer(name: string): string {
  const s = name.trim();
  const m = s.match(/^(י["׳״']?[אב]|[א-ת])[\s\-]*\d/);
  return m ? m[1].replace(/["׳״']/g, "") : "";
}

export function layerOf(row: SchoolClass): string {
  const typed = (row.layer ?? "").trim();
  if (typed) return typed;
  return guessLayer(row.name);
}

function teacherKey(t: Teacher): string {
  return t.id.toLowerCase();
}

function markedAnything(data: AppData, teacherId: string): boolean {
  const id = teacherId.toLowerCase();
  return data.responses.some(
    (r) =>
      r.teacherId.toLowerCase() === id &&
      (r.wantToLearn || r.mastered || r.hasProduct || r.readyToTeach),
  );
}

function teachersInClasses(data: AppData, classIds: Set<string>): Teacher[] {
  return data.teachers.filter((t) => (t.classIds ?? []).some((id) => classIds.has(id)));
}

function teachersInSubject(data: AppData, subjectId: string): Teacher[] {
  return data.teachers.filter((t) => (t.subjectIds ?? []).includes(subjectId));
}

export type ToolShare = {
  toolId: string;
  name: string;
  mastered: number;
  used: number;
  want: number;
  n: number;
};

export type SpreadGroup = {
  id: string;
  kind: "layer" | "class" | "subject";
  label: string;
  n: number;
  headline: string;
  tools: ToolShare[];
};

function toolShares(data: AppData, group: Teacher[]): ToolShare[] {
  const marked = group.filter((t) => markedAnything(data, t.id));
  const n = marked.length;
  if (!n) return [];
  const ids = new Set(marked.map(teacherKey));
  return data.tools
    .filter((t) => data.capabilities.some((c) => c.toolId === t.id))
    .map((tool) => {
      const caps = data.capabilities.filter((c) => c.toolId === tool.id);
      let mastered = 0;
      let used = 0;
      let want = 0;
      for (const tid of ids) {
        const rows = data.responses.filter(
          (r) => r.teacherId.toLowerCase() === tid && caps.some((c) => c.id === r.capabilityId),
        );
        const st = rows.map(primaryStatus);
        if (st.some((s) => s === "mastered" || s === "product" || s === "teach")) mastered += 1;
        if (st.some((s) => s !== "empty")) used += 1;
        if (st.some((s) => s === "want")) want += 1;
      }
      return { toolId: tool.id, name: tool.name, mastered, used, want, n };
    })
    .filter((row) => row.used > 0)
    .sort((a, b) => b.mastered - a.mastered || b.used - a.used);
}

function headlineFor(label: string, kind: SpreadGroup["kind"], tools: ToolShare[]): string {
  if (!tools.length) return "";
  const n = tools[0].n;
  const masteredBest = [...tools].sort((a, b) => b.mastered / b.n - a.mastered / a.n)[0];
  const usedBest = [...tools].sort((a, b) => b.used / b.n - a.used / a.n)[0];
  const wantBest = [...tools].sort((a, b) => b.want / b.n - a.want / a.n)[0];
  const masteredRate = masteredBest.mastered / n;
  const usedRate = usedBest.used / n;
  const wantRate = wantBest.want / n;
  if (kind === "subject") {
    if (usedRate >= 0.4) return `${label} משתמש ב${usedBest.name}`;
    if (masteredRate >= 0.35) return `${label} — שליטה ב${masteredBest.name}`;
    if (wantRate >= 0.4) return `${label} רוצה ללמוד ${wantBest.name}`;
    return `${label} · ${n} סימנו בטופס`;
  }
  if (masteredRate >= 0.4) return `ב${label} יש הרבה שליטה ב${masteredBest.name}`;
  if (usedRate >= 0.45) return `${label} משתמש ב${usedBest.name}`;
  if (wantRate >= 0.4) return `${label} רוצה ללמוד ${wantBest.name}`;
  return `${label} · ${n} סימנו בטופס`;
}

function groupFromTeachers(
  id: string,
  kind: SpreadGroup["kind"],
  label: string,
  data: AppData,
  group: Teacher[],
): SpreadGroup | null {
  const tools = toolShares(data, group);
  const n = tools[0]?.n ?? 0;
  if (!n) return null;
  return { id, kind, label, n, headline: headlineFor(label, kind, tools), tools };
}

export function skillSpread(data: AppData): { layers: SpreadGroup[]; subjects: SpreadGroup[] } {
  const classrooms = (data.classrooms ?? []).slice().sort((a, b) => a.order - b.order);
  const layerMap = new Map<string, { label: string; ids: Set<string> }>();
  const lone: SchoolClass[] = [];
  for (const row of classrooms) {
    const layer = layerOf(row);
    if (layer) {
      const key = layer;
      const cur = layerMap.get(key) ?? { label: `שכבת ${layer}`, ids: new Set<string>() };
      cur.ids.add(row.id);
      layerMap.set(key, cur);
    } else {
      lone.push(row);
    }
  }

  const layers: SpreadGroup[] = [];
  for (const [key, val] of layerMap) {
    const g = groupFromTeachers(`layer-${key}`, "layer", val.label, data, teachersInClasses(data, val.ids));
    if (g) layers.push(g);
  }
  for (const row of lone) {
    const g = groupFromTeachers(
      `class-${row.id}`,
      "class",
      `כיתה ${row.name}`,
      data,
      teachersInClasses(data, new Set([row.id])),
    );
    if (g) layers.push(g);
  }

  const subjects: SpreadGroup[] = [];
  for (const sub of (data.subjects ?? []).slice().sort((a, b) => a.order - b.order)) {
    const g = groupFromTeachers(
      `subj-${sub.id}`,
      "subject",
      `צוות ${sub.name}`,
      data,
      teachersInSubject(data, sub.id),
    );
    if (g) subjects.push(g);
  }

  return { layers, subjects };
}

export function spreadHeadlines(data: AppData, limit = 3): string[] {
  const { layers, subjects } = skillSpread(data);
  return [...layers, ...subjects]
    .filter((g) => g.headline)
    .sort((a, b) => b.n - a.n)
    .slice(0, limit)
    .map((g) => g.headline);
}
