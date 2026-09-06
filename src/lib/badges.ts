import type { AppData, BadgeDef } from "./types";

export function earnedBadgeIds(data: AppData, teacherId: string): string[] {
  const mine = data.responses.filter((r) => r.teacherId === teacherId);
  const earned: string[] = [];
  if (mine.some((r) => r.wantToLearn || r.mastered || r.hasProduct || r.readyToTeach)) {
    earned.push("first");
  }
  if (mine.filter((r) => r.wantToLearn).length >= 8) earned.push("aspire");
  if (mine.filter((r) => r.mastered).length >= 10) earned.push("expert");
  if (mine.filter((r) => r.hasProduct).length > 5) earned.push("doer");
  if (mine.some((r) => r.readyToTeach)) earned.push("mentor");
  if (mine.some((r) => r.savedForLater)) earned.push("curious");
  return earned;
}

export function badgeById(data: AppData, id: string): BadgeDef | undefined {
  return data.badges.find((b) => b.id === id);
}
