import type { CapabilityResponse, LearnHow } from "./types";

export const LEARN_HOW_LABEL: Record<LearnHow, string> = {
  team_evening: "במפגש צוות בערב",
  video_doc: "סרטון או מסמך הדרכה",
  one_on_one: "מפגש 1:1",
};

export type StatusKey = "empty" | "want" | "mastered" | "product" | "teach";

export function primaryStatus(r?: CapabilityResponse): StatusKey {
  if (!r) return "empty";
  if (r.readyToTeach) return "teach";
  if (r.hasProduct) return "product";
  if (r.mastered) return "mastered";
  if (r.wantToLearn) return "want";
  return "empty";
}

export const STATUS_META: Record<
  StatusKey,
  { label: string; color: string; soft: string }
> = {
  empty: { label: "טרם סומן", color: "#9aa3ad", soft: "#eef1f4" },
  want: { label: "רוצה ללמוד", color: "#e8a317", soft: "#fff3d1" },
  mastered: { label: "שולטת", color: "#2bb39a", soft: "#d9f5ef" },
  product: { label: "יש תוצר", color: "#7b61ff", soft: "#ebe6ff" },
  teach: { label: "מלמדת", color: "#5b7cfa", soft: "#e8eeff" },
};

export function emptyResponse(teacherId: string, capabilityId: string): CapabilityResponse {
  return {
    teacherId,
    capabilityId,
    wantToLearn: false,
    mastered: false,
    hasProduct: false,
    readyToTeach: false,
    savedForLater: false,
    completedLearning: false,
    updatedAt: new Date().toISOString(),
  };
}

export function displayName(first: string, last: string): string {
  return `${first} ${last}`.trim();
}

export function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`;
}

export function formatHebDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
