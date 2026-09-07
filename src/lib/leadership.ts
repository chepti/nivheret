import { LEARN_HOW_LABEL } from "./status";
import type { AppData, Capability, LearnHow, Teacher } from "./types";

export function findTeacher(data: AppData, teacherId: string): Teacher | undefined {
  const id = teacherId.toLowerCase();
  return data.teachers.find((t) => t.id.toLowerCase() === id || t.email.toLowerCase() === id);
}

export function teacherName(data: AppData, teacherId: string): string {
  const t = findTeacher(data, teacherId);
  return t ? `${t.firstName} ${t.lastName}` : teacherId;
}

export function teacherEmail(data: AppData, teacherId: string): string {
  const t = findTeacher(data, teacherId);
  return (t?.email ?? teacherId).toLowerCase();
}

export function openMail(emails: string[], subject: string, body: string) {
  const unique = [...new Set(emails.filter(Boolean).map((e) => e.toLowerCase()))];
  if (!unique.length) return;
  const href = `mailto:?bcc=${unique.map(encodeURIComponent).join(",")}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = href;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export type CapInsight = {
  cap: Capability;
  toolName: string;
  want: { id: string; name: string; how?: LearnHow }[];
  teach: { id: string; name: string }[];
  product: { id: string; name: string; url?: string }[];
  howCounts: Record<LearnHow, number>;
  suggest: string;
};

export function capabilityInsights(data: AppData): CapInsight[] {
  return data.capabilities
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((cap) => {
      const rows = data.responses.filter((r) => r.capabilityId === cap.id);
      const howCounts: Record<LearnHow, number> = { team_evening: 0, video_doc: 0, one_on_one: 0 };
      const want = rows
        .filter((r) => r.wantToLearn)
        .map((r) => {
          if (r.learnHow) howCounts[r.learnHow] += 1;
          return { id: r.teacherId, name: teacherName(data, r.teacherId), how: r.learnHow };
        });
      const teach = rows.filter((r) => r.readyToTeach).map((r) => ({ id: r.teacherId, name: teacherName(data, r.teacherId) }));
      const product = rows
        .filter((r) => r.hasProduct)
        .map((r) => {
          const reac = data.reactions.find((x) => x.capabilityId === cap.id && x.teacherId.toLowerCase() === r.teacherId.toLowerCase());
          return { id: r.teacherId, name: teacherName(data, r.teacherId), url: reac?.productUrl };
        });
      const topHow = (Object.keys(howCounts) as LearnHow[]).sort((a, b) => howCounts[b] - howCounts[a])[0];
      let suggest = "עוד אין מספיק סימונים.";
      if (want.length && howCounts[topHow] > 0) {
        suggest = `כדאי ללמד ב־${LEARN_HOW_LABEL[topHow]} (${howCounts[topHow]} מורות).`;
        if (topHow === "one_on_one" && teach.length) suggest += ` יש ${teach.length} מוכנים ללמד — אפשר לשדך.`;
        if (topHow === "one_on_one" && !teach.length) suggest += " אין עדיין מלמדים — כדאי מפגש צוות או סרטון.";
      } else if (teach.length) {
        suggest = `${teach.length} מוכנים ללמד. אפשר לשדך למורות שירצו.`;
      }
      return {
        cap,
        toolName: data.tools.find((t) => t.id === cap.toolId)?.name ?? "",
        want,
        teach,
        product,
        howCounts,
        suggest,
      };
    })
    .filter((row) => row.want.length || row.teach.length || row.product.length)
    .sort((a, b) => b.want.length - a.want.length);
}

export type Pair = {
  id: string;
  capabilityId: string;
  capabilityTitle: string;
  learnerId: string;
  learnerName: string;
  mentorId: string;
  mentorName: string;
  done: boolean;
};

export function pairKey(learnerId: string, mentorId: string, capabilityId: string): string {
  return `${learnerId.toLowerCase()}__${mentorId.toLowerCase()}__${capabilityId}`;
}

export function suggestedPairs(data: AppData): { pairs: Pair[]; unmatched: { name: string; capabilityTitle: string }[] } {
  const doneMap = new Map((data.pairs ?? []).map((p) => [p.id, p]));
  const pairs: Pair[] = [];
  const unmatched: { name: string; capabilityTitle: string }[] = [];
  for (const row of capabilityInsights(data)) {
    const learners = row.want.filter((w) => !row.teach.some((t) => t.id.toLowerCase() === w.id.toLowerCase()));
    const mentors = [...row.teach];
    learners.forEach((learner, i) => {
      const mentor = mentors[i % mentors.length];
      if (!mentor) {
        unmatched.push({ name: learner.name, capabilityTitle: row.cap.title });
        return;
      }
      const id = pairKey(learner.id, mentor.id, row.cap.id);
      pairs.push({
        id,
        capabilityId: row.cap.id,
        capabilityTitle: row.cap.title,
        learnerId: learner.id,
        learnerName: learner.name,
        mentorId: mentor.id,
        mentorName: mentor.name,
        done: Boolean(doneMap.get(id)?.done),
      });
    });
  }
  return { pairs, unmatched };
}

export function myPairs(data: AppData, teacherId: string): Pair[] {
  const id = teacherId.toLowerCase();
  return suggestedPairs(data).pairs.filter(
    (p) => p.learnerId.toLowerCase() === id || p.mentorId.toLowerCase() === id,
  );
}
