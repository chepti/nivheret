import type { AppData, BadgeDef, BadgeMetric, CapabilityResponse } from "./types";

export const METRIC_OPTIONS: { id: BadgeMetric; label: string; template: string }[] = [
  { id: "wantToLearn", label: "רוצה ללמוד", template: "סימנת {current} מתוך {target} תחומים" },
  { id: "mastered", label: "שולטת", template: "שולטת ב־{current} מתוך {target} יכולות" },
  { id: "hasProduct", label: "תוצרים", template: "העלית {current} מתוך {target} תוצרים" },
  { id: "readyToTeach", label: "מלמדת", template: "מוכנה ללמד {current} מתוך {target} יכולות" },
  { id: "savedForLater", label: "שמור להמשך", template: "שמרת {current} מתוך {target} פריטים" },
  { id: "completedLearning", label: "שיעורים", template: "השלמת {current} מתוך {target} שיעורים" },
  { id: "anyMarked", label: "מילוי טופס", template: "מילאת את הטופס — {current} מתוך {target}" },
];

const LEGACY: Record<string, { metric: BadgeMetric; target: number }> = {
  aspire: { metric: "wantToLearn", target: 10 },
  expert: { metric: "mastered", target: 10 },
  doer: { metric: "hasProduct", target: 6 },
  mentor: { metric: "readyToTeach", target: 1 },
  first: { metric: "anyMarked", target: 1 },
  curious: { metric: "savedForLater", target: 3 },
};

export function normalizeBadge(raw: BadgeDef): BadgeDef {
  const legacy = LEGACY[raw.id];
  return {
    ...raw,
    metric: raw.metric ?? legacy?.metric ?? "wantToLearn",
    target: raw.target > 0 ? raw.target : legacy?.target ?? 1,
    description: raw.description || (METRIC_OPTIONS.find((m) => m.id === (raw.metric ?? legacy?.metric))?.template ?? ""),
  };
}

export function countMetric(rows: CapabilityResponse[], metric: BadgeMetric): number {
  if (metric === "wantToLearn") return rows.filter((r) => r.wantToLearn).length;
  if (metric === "mastered") return rows.filter((r) => r.mastered).length;
  if (metric === "hasProduct") return rows.filter((r) => r.hasProduct).length;
  if (metric === "readyToTeach") return rows.filter((r) => r.readyToTeach).length;
  if (metric === "savedForLater") return rows.filter((r) => r.savedForLater).length;
  if (metric === "completedLearning") return rows.filter((r) => r.completedLearning).length;
  return rows.some((r) => r.wantToLearn || r.mastered || r.hasProduct || r.readyToTeach) ? 1 : 0;
}

export function badgeLine(badge: BadgeDef, current: number): string {
  const b = normalizeBadge(badge);
  const fallback = METRIC_OPTIONS.find((m) => m.id === b.metric)?.template ?? "{current} מתוך {target}";
  const tpl = b.description.includes("{current}") ? b.description : fallback;
  return tpl.replaceAll("{current}", String(current)).replaceAll("{target}", String(b.target));
}

export function teacherBadgeRows(data: AppData, teacherId: string) {
  const id = teacherId.toLowerCase();
  const mine = data.responses.filter((r) => r.teacherId.toLowerCase() === id);
  return data.badges.map((raw) => {
    const badge = normalizeBadge(raw);
    const current = countMetric(mine, badge.metric);
    return {
      badge,
      current,
      target: badge.target,
      earned: current >= badge.target,
      text: badgeLine(badge, current),
    };
  });
}

export function earnedBadgeIds(data: AppData, teacherId: string): string[] {
  return teacherBadgeRows(data, teacherId).filter((r) => r.earned).map((r) => r.badge.id);
}
