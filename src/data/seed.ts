import type {
  AppData,
  BadgeDef,
  Capability,
  Institution,
  Lesson,
  Meeting,
  Period,
  Settings,
  Tool,
} from "../lib/types";
import teachersJson from "./teachers.json";

export const ADMIN_EMAILS = ["039698329@tzviama.com", "chepti@gmail.com"];

const institutions: Institution[] = [
  {
    id: "tzviama",
    symbol: "141176",
    name: "אולפנת צביה מעלה אדומים",
    domain: "tzviama.com",
  },
];

const periods: Period[] = [
  { id: "elul-tishrei", name: "אלול–תשרי", months: "תחילת השנה", order: 1 },
  { id: "heshvan-kislev", name: "חשוון–כסלו", months: "סתיו", order: 2 },
  { id: "tevet-shvat", name: "טבת–שבט", months: "חורף", order: 3 },
  { id: "adar-nisan", name: "אדר–ניסן", months: "אביב", order: 4 },
  { id: "iyar-sivan", name: "אייר–סיוון", months: "סוף השנה", order: 5 },
];

const tools: Tool[] = [
  {
    id: "classroom",
    periodId: "elul-tishrei",
    name: "Classroom",
    subtitle: "הכיתה הדיגיטלית",
    icon: "classroom",
    color: "#f5c518",
    description: "ניהול כיתה, מטלות ומשוב במקום אחד.",
    order: 1,
  },
  {
    id: "gemini",
    periodId: "heshvan-kislev",
    name: "Gemini",
    subtitle: "עוזרת חכמה להוראה",
    icon: "gemini",
    color: "#8b7cff",
    description: "ייווצר כאן תוכן ב־CMS כשיתמלא החודש.",
    order: 2,
  },
  {
    id: "forms",
    periodId: "tevet-shvat",
    name: "Forms",
    subtitle: "שאלונים ומבחנים",
    icon: "forms",
    color: "#7b61ff",
    description: "ייווצר כאן תוכן ב־CMS כשיתמלא החודש.",
    order: 3,
  },
  {
    id: "drive",
    periodId: "adar-nisan",
    name: "Drive",
    subtitle: "קבצים ושיתוף",
    icon: "drive",
    color: "#3ecf8e",
    description: "ייווצר כאן תוכן ב־CMS כשיתמלא החודש.",
    order: 4,
  },
  {
    id: "meet",
    periodId: "iyar-sivan",
    name: "Meet",
    subtitle: "מפגשים מרחוק",
    icon: "meet",
    color: "#ff8a65",
    description: "ייווצר כאן תוכן ב־CMS כשיתמלא החודש.",
    order: 5,
  },
];

const classroomCaps: Capability[] = [
  ["cap-class-open", "פתיחת כיתה חדשה", "ליצור כיתה, לתת לה שם ולשייך מקצוע."],
  ["cap-class-invite", "הזמנת תלמידות", "לשלוח קוד או קישור ולהצטרף לכיתה."],
  ["cap-class-topics", "ארגון בנושאים", "לחלק את הכיתה לנושאים ברורים לאורך השנה."],
  ["cap-class-materials", "העלאת חומרי לימוד", "לצרף קובץ, קישור או מצגת לחומר הכיתה."],
  ["cap-class-assignment", "יצירת מטלה", "ליצור מטלה עם תאריך הגשה והנחיה ברורה."],
  ["cap-class-feedback", "בדיקה ומשוב", "לבדוק עבודה, להחזיר הערה ולתת ציון."],
  ["cap-class-announce", "הודעה לכיתה", "לפרסם עדכון שכל התלמידות רואות."],
  ["cap-class-share", "שיתוף עם מורה עמיתה", "להוסיף מורה שותפה לכיתה."],
  ["cap-class-progress", "מעקב התקדמות", "לראות מי הגישה ומי עוד ממתינה."],
].map(([id, title, description], order) => ({
  id,
  toolId: "classroom",
  title,
  description,
  order: order + 1,
}));

const lessons: Lesson[] = [
  {
    id: "lesson-class-open",
    capabilityId: "cap-class-open",
    title: "איך פותחים כיתה ב־Classroom",
    body: "נכנסות ל־classroom.google.com, לוחצות על + ובוחרות «צור כיתה». נותנות שם ברור (מקצוע + שכבה) ומאשרות. הקוד יופיע בראש הכיתה — אותו תשלחו לתלמידות.",
    videoUrl: "https://www.youtube.com/embed/IhoKLbmpr4A",
    autoCompleteOnQuiz: true,
    quiz: [
      {
        id: "q1",
        prompt: "איפה מוצאים את קוד הכיתה אחרי הפתיחה?",
        options: ["בהגדרות החשבון", "בראש דף הכיתה", "בתיבת הדואר"],
        correctIndex: 1,
      },
      {
        id: "q2",
        prompt: "מה כדאי לכלול בשם הכיתה?",
        options: ["רק שם פרטי", "מקצוע ושכבה", "סיסמה אקראית"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "lesson-class-invite",
    capabilityId: "cap-class-invite",
    title: "הזמנת תלמידות לכיתה",
    body: "אפשר לשתף את קוד הכיתה, לשלוח קישור הזמנה, או להוסיף מיילים ידנית. מומלץ לפרסם את הקוד גם במשו״ב או בהודעת פתיחת שנה.",
    autoCompleteOnQuiz: true,
    quiz: [
      {
        id: "q1",
        prompt: "איך תלמידה מצטרפת עם קוד?",
        options: ["כותבת במייל למורה", "לוחצת + ובוחרת «הצטרפי לכיתה»", "פותחת Drive"],
        correctIndex: 1,
      },
    ],
  },
];

const meetings: Meeting[] = [
  {
    id: "meet-classroom-evening",
    title: "ערב צוות: Classroom למתחילות",
    topic: "אוריינות דיגיטלית",
    datetime: "2026-09-16T19:30:00",
    location: "חדר מורים",
    description: "נתנסה יחד בפתיחת כיתה, הזמנה ומטלה ראשונה. מורות שכבר שולטות מוזמנות להצטרף כמלוות.",
  },
  {
    id: "meet-mechanchot",
    title: "ישיבת מחנכות — שכבת ז׳",
    topic: "חינוך ושיח כיתתי",
    datetime: "2026-09-10T15:00:00",
    location: "חדר ישיבות",
    description: "לא דיגיטלי: ליווי בנות, קשר עם הורים ותיאום מחנכות.",
  },
  {
    id: "meet-sukkot",
    title: "הכנה לחג ולחופשת סוכות",
    topic: "חיי אולפנה",
    datetime: "2026-09-28T14:00:00",
    location: "אולם",
    description: "לו״ז, שמירות ומה שקורה בפנימייה בחופשה.",
  },
];

const badges: BadgeDef[] = [
  { id: "aspire", title: "שאיפות גבוהות", description: "סימנת {current} מתוך {target} תחומים", icon: "sparkles", metric: "wantToLearn", target: 10 },
  { id: "expert", title: "מומחית", description: "שולטת ב־{current} מתוך {target} יכולות", icon: "award", metric: "mastered", target: 10 },
  { id: "doer", title: "מיישמת", description: "העלית {current} מתוך {target} תוצרים", icon: "package", metric: "hasProduct", target: 6 },
  { id: "mentor", title: "מלמדת", description: "מוכנה ללמד {current} מתוך {target} יכולות", icon: "heart-handshake", metric: "readyToTeach", target: 1 },
  { id: "first", title: "ראשונה בשער", description: "מילאת את הטופס — {current} מתוך {target}", icon: "flag", metric: "anyMarked", target: 1 },
  { id: "curious", title: "סקרנית", description: "שמרת {current} מתוך {target} פריטים", icon: "bookmark", metric: "savedForLater", target: 3 },
];

const settings: Settings = {
  adminEmails: ADMIN_EMAILS,
  praiseNote: "השבוע שווה לפרגן למי שכבר מוכנה ללמד עמיתה, ולמי שהעזה לסמן «רוצה ללמוד».",
  weakIdFormOpen: true,
};

export function createSeed(): AppData {
  const teachers = (teachersJson as AppData["teachers"]).map((t) => ({
    ...t,
    role: ADMIN_EMAILS.includes(t.email.toLowerCase()) ? "admin" : t.role,
  }));
  return {
    institutions,
    teachers,
    periods,
    tools,
    capabilities: classroomCaps,
    lessons,
    responses: [],
    reactions: [],
    meetings,
    rsvps: [],
    badges,
    settings,
  };
}
