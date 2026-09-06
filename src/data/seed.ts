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
    name: "בוט GEM בג'מיני",
    subtitle: "ליווי חכם להוראה וללמידה",
    icon: "gemini",
    color: "#8b7cff",
    description: "ייווצר כאן תוכן ב־CMS כשיתמלא החודש.",
    order: 2,
  },
  {
    id: "forms",
    periodId: "tevet-shvat",
    name: "נוטבוק",
    subtitle: "יצירת חומרי לימוד, סיוע במחקר והמרת תוכן לימודי בין פורמטים. מחולל מצגות, כרזות, פודקאסט ווידאו סקירה, ועוד.מסייע לבדיקת עבודות.",
    icon: "forms",
    color: "#7b61ff",
    description: "ייווצר כאן תוכן ב־CMS כשיתמלא החודש.",
    order: 3,
  },
  {
    id: "drive",
    periodId: "adar-nisan",
    name: "קנבס - מישחוק",
    subtitle: "יצירת פריטים אינטראקטיביים ללמידה - במקרן או באופן עצמאי",
    icon: "drive",
    color: "#3ecf8e",
    description: "ייווצר כאן תוכן ב־CMS כשיתמלא החודש.",
    order: 4,
  },
  {
    id: "meet",
    periodId: "iyar-sivan",
    name: "וידאו ותמונות",
    subtitle: "להחיות את הלמידה",
    icon: "meet",
    color: "#ff8a65",
    description: "ייווצר כאן תוכן ב־CMS כשיתמלא החודש.",
    order: 5,
  },
];

const capabilities: Capability[] = [
  {
    id: "cap-class-open",
    toolId: "classroom",
    title: "פתיחת כיתה חדשה",
    description: "ליצור כיתה, לתת לה שם ולשייך מקצוע.\nהגדרת הכיתה כך שתישאר מסודרת",
    order: 1,
  },
  {
    id: "cap-class-materials",
    toolId: "classroom",
    title: "העלאת חומרי לימוד",
    description: "לצרף קובץ, קישור או מצגת לחומר הכיתה.",
    order: 4,
  },
  {
    id: "cap-class-assignment",
    toolId: "classroom",
    title: "יצירת מטלה",
    description: "ליצור מטלה עם תאריך הגשה והנחיה ברורה.",
    order: 5,
  },
  {
    id: "cap-jr1vh03",
    toolId: "classroom",
    title: "יצירת בוחן",
    description: "יצירת טופס עם ניקוד - ידני\nואיך להיעזר בבינה כדי שהיא תחולל את הכל, ואנחנו רק נוודא שתקין",
    order: 6,
  },
  {
    id: "cap-8g5a8i5",
    toolId: "gemini",
    title: "בוט מלווה משימה",
    description: "נכין GEM שמלווה את תהלמידות תוך כדי שהן יוצרות עבודה, מצגת או מפת מושגים",
    order: 10,
  },
  {
    id: "cap-8ax8r35",
    toolId: "gemini",
    title: "בוט שקרן",
    description: "נכין GEM שמאתגר את התלמידות ומסייע להן ללמוד יחידת חומר ולברור את הטעויות",
    order: 11,
  },
  {
    id: "cap-wdm3d0h",
    toolId: "gemini",
    title: "בוט תמונות",
    description: "נבנה בוט שיודע ליצור תמונות עם מאפיין מוכן מראש",
    order: 12,
  },
  {
    id: "cap-c20gnnk",
    toolId: "forms",
    title: "הפקת חומרי למידה",
    description: "הוספת מקורות משלנו",
    order: 1,
  },
  {
    id: "cap-289yjjh",
    toolId: "forms",
    title: "יצירת מצגת",
    description: "הזנת חומרים או חיפוש, יצירת מתווה ויצירת מצגת איכותית",
    order: 2,
  },
  {
    id: "cap-8x5hu6g",
    toolId: "forms",
    title: "בדיקת עבודה או מבחן עם נוטבוק",
    description: "איך מצרפים מחוון ומבחן (מקוון) או קבצים שהתלמידים הגישו או מצגת שיתופית, ומסתייעים בנוטבוק כדי להעריך. אבטחה ומהימנות.",
    order: 3,
  },
  {
    id: "cap-76fu2bw",
    toolId: "drive",
    title: "יצירת משחק מקרן",
    description: "יוצרים בג'מיני קנבס את המשחק, עם ניקוד לפי קבוצות, מסוגים שונים, ומשתמשים בכיתה",
    order: 1,
  },
  {
    id: "cap-64hl5j6",
    toolId: "drive",
    title: "יצירת לומדה ",
    description: "יוצרים בג'מיני קנבס את הפעילות הלימודית, משלבים תמונות וסרטונים, ומשתפים.\nמגדירים מסך סיום שהתלמידות שולחות למורה עם ההישגים.",
    order: 2,
  },
];

const lessons: Lesson[] = [];

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
    capabilities,
    lessons,
    responses: [],
    reactions: [],
    meetings,
    rsvps: [],
    pairs: [],
    badges,
    settings,
  };
}
