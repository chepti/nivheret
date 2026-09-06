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
    description: "עוזרת חכמה להוראה: תכנון, חומרי למידה ונוטבוק.",
    order: 2,
  },
  {
    id: "forms",
    periodId: "tevet-shvat",
    name: "Forms",
    subtitle: "שאלונים ומבחנים",
    icon: "forms",
    color: "#7b61ff",
    description: "יצירת שאלון, מבחן וייצוא למסמך.",
    order: 3,
  },
  {
    id: "drive",
    periodId: "adar-nisan",
    name: "Drive",
    subtitle: "קבצים ושיתוף",
    icon: "drive",
    color: "#3ecf8e",
    description: "תיקיות, שיתוף מסמכים וסביבת עבודה מסודרת.",
    order: 4,
  },
  {
    id: "meet",
    periodId: "iyar-sivan",
    name: "Meet",
    subtitle: "מפגשים מרחוק",
    icon: "meet",
    color: "#ff8a65",
    description: "שיתוף מסך ולמידה מרחוק מעבר לשיחת וידאו.",
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

const extraCaps: Capability[] = [
  ["cap-gemini-start", "gemini", "בינה בכיתה — מאיפה מתחילים", "להבין מה AI עושה בהוראה ואיך ניגשות בזהירות."],
  ["cap-gemini-notebook", "gemini", "הפקת חומרי למידה בנוטבוק", "לבנות מחברת מקורות ולהוציא ממנה מערך."],
  ["cap-gemini-worksheets", "gemini", "דפי עבודה להדפסה", "להפוך תוכן לכרטיסיות ודפי A4."],
  ["cap-gemini-async", "gemini", "יחידה א־סינכרונית", "לתכנן שיעור שהתלמידות עושות גם בלי מפגש חי."],
  ["cap-gemini-vids", "gemini", "סרטון קצר בגוגל וידס", "להרכיב סרטון הוראה מהדרייב."],
  ["cap-forms-ai", "forms", "טופס בעזרת בינה", "לתת לבינה לנסח שאלון בפורמס."],
  ["cap-forms-export", "forms", "ייצוא טופס למסמך", "להוציא את השאלות למסמך לעריכה או להדפסה."],
  ["cap-drive-folders", "drive", "עץ תיקיות בענן", "לסדר סביבת עבודה כדי למצוא קבצים."],
  ["cap-drive-share", "drive", "מסמך שיתופי", "לפתוח דוק ולשתף עם עמיתה או כיתה."],
  ["cap-meet-share", "meet", "שיתוף מסך", "לשתף ועדיין לראות את התלמידות."],
  ["cap-meet-beyond", "meet", "למידה מרחוק מעבר לווידאו", "לא רק מפגש זום — גם משימה ומרחב."],
].map(([id, toolId, title, description], order) => ({
  id,
  toolId,
  title,
  description,
  order: order + 1,
}));

function embed(id: string): string {
  return `https://www.youtube.com/embed/${id}`;
}

function quiz(id: string, prompt: string, options: [string, string, string], correctIndex: number) {
  return { id, prompt, options, correctIndex };
}

const lessons: Lesson[] = [
  {
    id: "lesson-class-open",
    capabilityId: "cap-class-open",
    title: "איך מתחילים כיתה ב־Classroom",
    body: "<p>נכנסות ל־classroom.google.com, לוחצות על + ובוחרות «צור כיתה». נותנות שם ברור — מקצוע ושכבה — ומאשרות.</p><p>הקוד יופיע בראש הכיתה. אותו שולחות לתלמידות, במשו״ב או בהודעת פתיחת שנה.</p><p>בסרטון תראו כניסה, פתיחת מרחב, משימה ראשונה והוספת תלמידות.</p>",
    videoUrl: embed("RtEmnhrNg70"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-open-1", "איפה מוצאים את קוד הכיתה אחרי הפתיחה?", ["בהגדרות החשבון", "בראש דף הכיתה", "בתיבת הדואר"], 1),
      quiz("q-open-2", "מה כדאי לכלול בשם הכיתה?", ["רק שם פרטי", "מקצוע ושכבה", "סיסמה אקראית"], 1),
    ],
  },
  {
    id: "lesson-class-invite",
    capabilityId: "cap-class-invite",
    title: "הזמנת תלמידות לכיתה",
    body: "<p>אפשר לשתף קוד כיתה, קישור הזמנה, או להוסיף מיילים בלשונית האנשים.</p><p>מומלץ לפרסם את הקוד גם במשו״ב. התלמידה לוחצת + ובוחרת «הצטרפי לכיתה».</p><p>בסרטון של תחילת העבודה תראו גם את הוספת התלמידות.</p>",
    videoUrl: embed("RtEmnhrNg70"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-inv-1", "איך תלמידה מצטרפת עם קוד?", ["כותבת במייל למורה", "לוחצת + ובוחרת «הצטרפי לכיתה»", "פותחת Drive"], 1),
      quiz("q-inv-2", "איפה עוד כדאי לפרסם את הקוד?", ["רק בווטסאפ פרטי", "גם במשו״ב או בהודעת פתיחה", "רק בהערות לעצמי"], 1),
    ],
  },
  {
    id: "lesson-class-year",
    capabilityId: "cap-class-announce",
    title: "קלאסרום לשנה חדשה",
    body: "<p>בתחילת שנה כדאי באנר, הודעת פתיחה, וחומר ראשון במקום אחד.</p><p>הסרטון עובר בדף הבית החדש, בעיצוב הכיתה, ובהודעה עם הגדרות תגובה.</p><p>אפשר לקפוץ בפרקים ישר לחלק שצריכות היום.</p>",
    videoUrl: embed("8x03F22A2Tc"),
    chapters: [
      { t: 0, label: "דף הבית החדש" },
      { t: 44, label: "עיצוב באנר לכיתה" },
      { t: 89, label: "הודעת פתיחה והגדרות תגובה" },
      { t: 142, label: "הוספת מצגת רצף שנתית" },
      { t: 167, label: "יצירת מטלה ועותק לתלמידים" },
      { t: 226, label: "יצירת מחוון ב-AI" },
      { t: 285, label: "עריכת קריטריונים וניקוד" },
      { t: 342, label: "בדיקת עבודות וסיכום" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-year-1", "למה כדאי הודעת פתיחה בכיתה?", ["רק בשביל יופי", "כדי שכל התלמידות יראו עדכון במקום אחד", "כדי למחוק את הקוד"], 1),
      quiz("q-year-2", "מה אפשר לעשות מהרשימת הפרקים?", ["רק להוריד את הסרטון", "לקפוץ לקטע שצריכות עכשיו", "לשנות את שם הכיתה"], 1),
    ],
  },
  {
    id: "lesson-class-topics",
    capabilityId: "cap-class-topics",
    title: "ארגון חומר במצגת רצף",
    body: "<p>במקום עשרות קישורים — מצגת אחת שגדלה לאורך השנה, עם תוכן עניינים.</p><p>אפשר לקשר סרטונים, מסמכים חיים ופעילויות. נושאים נשארים ברורים גם לחודש הבא.</p><p>בסרטון תראו בנייה, הטמעה ושיתוף עם מורה עמיתה.</p>",
    videoUrl: embed("H7ABMS4CRN0"),
    chapters: [
      { t: 0, label: "הרעיון למצגת רצף שנתית" },
      { t: 41, label: "בנייה בקנבה ותוכן עניינים" },
      { t: 80, label: "קישור פעילויות וסרטונים" },
      { t: 101, label: "הטמעת מצגות ומסמכים חיים" },
      { t: 200, label: "פעילויות אינטראקטיביות" },
      { t: 308, label: "ארגון נושאים עם כותרות" },
      { t: 373, label: "שיתוף עם מורות אחרות" },
      { t: 494, label: "תכנון שיעורים עתידיים" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-top-1", "מה היתרון של מצגת רצף אחת?", ["חוסכת סיסמה", "מרכזת את חומר השנה במקום אחד עם ניווט", "מוחקת מטלות ישנות"], 1),
      quiz("q-top-2", "איך שומרות על סדר בנושאים?", ["רק בצבע אקראי", "עם תוכן עניינים וכותרות בולטות", "בלי שמות בכלל"], 1),
    ],
  },
  {
    id: "lesson-class-assign",
    capabilityId: "cap-class-assignment",
    title: "מטלה ראשונה עם מחוון",
    body: "<p>מטלה טובה: הנחיה קצרה, תאריך, ועותק לכל תלמידה כשצריך.</p><p>אפשר להוסיף מחוון — גם בעזרת AI — ואז לערוך קריטריונים וניקוד.</p><p>בקפיצה לפרק «יצירת מטלה» תגיעו ישר לחלק הזה בסרטון השנה החדשה.</p>",
    videoUrl: embed("8x03F22A2Tc"),
    chapters: [
      { t: 167, label: "יצירת מטלה ועותק לתלמידים" },
      { t: 226, label: "יצירת מחוון ב-AI" },
      { t: 285, label: "עריכת קריטריונים וניקוד" },
      { t: 342, label: "בדיקת עבודות וסיכום" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-as-1", "מתי כדאי «עותק לתלמידים»?", ["תמיד, גם בהודעה", "כשכל אחת ממלאה את המסמך שלה", "רק אם אין תאריך"], 1),
      quiz("q-as-2", "מה עושים אחרי שמחוון נוצר ב-AI?", ["שולחים כמו שהוא בלי קריאה", "עורכות קריטריונים וניקוד לפי מה שבאמת בודקות", "מוחקות את המטלה"], 1),
    ],
  },
  {
    id: "lesson-class-feedback",
    capabilityId: "cap-class-feedback",
    title: "בדיקה, מחוון ומשוב",
    body: "<p>אחרי ההגשה נכנסות לעבודה, כותבות הערה ונותנות ציון לפי המחוון.</p><p>המחוון חוסך ניסוח מחדש בכל מחברת — והתלמידה מבינה מה חזק ומה לשפר.</p>",
    videoUrl: embed("8x03F22A2Tc"),
    chapters: [
      { t: 226, label: "יצירת מחוון ב-AI" },
      { t: 285, label: "עריכת קריטריונים וניקוד" },
      { t: 342, label: "בדיקת עבודות וסיכום" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-fb-1", "למה מחוון עוזר בבדיקה?", ["הוא מחליף את המורה לגמרי", "הקריטריונים ברורים והציון עקבי יותר", "הוא מוחק עבודות חלשות"], 1),
      quiz("q-fb-2", "מה עוד כדאי להחזיר לתלמידה?", ["רק מספר", "הערה קצרה ליד הציון", "קישור לחשבון האישי של המורה"], 1),
    ],
  },
  {
    id: "lesson-class-share",
    capabilityId: "cap-class-share",
    title: "ארגז חול למורות",
    body: "<p>לפני שפותחות כיתה לתלמידות — כדאי כיתה אחת לצוות: לטעות, לנסות, לשאול.</p><p>מוסיפות מורות בלשונית האנשים, לפי שם או קוד. אחרי ההתנסות הרבה יותר קל לפתוח כיתה אמיתית.</p>",
    videoUrl: embed("5gKnAcA2VBM"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-sh-1", "מה זה ארגז חול כאן?", ["תיקיית Drive סודית", "כיתת אימון למורות, בלי תלמידות", "מבחן סוף שנה"], 1),
      quiz("q-sh-2", "איך מוסיפים מורה עמיתה?", ["רק בווטסאפ", "בלשונית האנשים — שם, קוד או קישור", "רק דרך מזכירות"], 1),
    ],
  },
  {
    id: "lesson-class-materials",
    capabilityId: "cap-class-materials",
    title: "חומר לימוד במקום אחד",
    body: "<p>אפשר לצרף מצגת רצף, קובץ או קישור לחומר הכיתה — לא רק מטלה.</p><p>בסרטון השנה החדשה יש קטע קצר על הוספת מצגת. במצגת הרצף תראו איך מחזיקות את כל השנה.</p>",
    videoUrl: embed("H7ABMS4CRN0"),
    chapters: [
      { t: 80, label: "קישור פעילויות וסרטונים" },
      { t: 101, label: "הטמעת מצגות ומסמכים חיים" },
      { t: 200, label: "פעילויות אינטראקטיביות" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-mat-1", "איפה כדאי לשים חומר קבוע?", ["רק במייל", "בחומר הכיתה או במצגת רצף משותפת", "רק במחשב בבית"], 1),
      quiz("q-mat-2", "מה אפשר להטמיע במצגת רצף?", ["רק תמונת פרופיל", "מסמכים חיים, סרטונים ופעילויות", "רק ציונים"], 1),
    ],
  },
  {
    id: "lesson-class-progress",
    capabilityId: "cap-class-progress",
    title: "לראות מי הגישה",
    body: "<p>בדף המטלה רואים מי הגישה ומי ממתינה. משם נכנסות לבדיקה.</p><p>בסוף הסרטון על השנה החדשה יש סיכום קצר של בדיקת עבודות.</p>",
    videoUrl: embed("8x03F22A2Tc"),
    chapters: [{ t: 342, label: "בדיקת עבודות וסיכום" }],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-pr-1", "איפה רואים מי עוד לא הגישה?", ["בהגדרות המשתמש", "בדף המטלה", "ביומן האישי"], 1),
      quiz("q-pr-2", "מה כדאי אחרי שמזהות מי ממתינה?", ["למחוק את המטלה", "תזכורת קצרה או שיחה, בלי להעליב בפומבי", "לפרסם שמות בכיתה"], 1),
    ],
  },
  {
    id: "lesson-gemini-start",
    capabilityId: "cap-gemini-start",
    title: "בינה בכיתה — מבט ראשון",
    body: "<p>לפני שרצות לכלי: מה AI יודע, איפה הוא טועה, ומה אומר משרד החינוך.</p><p>הסרטון ארוך — לכן יש פרקים. אפשר להתחיל ב«מה זה AI», ואחר כך לבחור כלי אחד לנסות השבוע.</p>",
    videoUrl: embed("NnsUdSOUhg4"),
    chapters: [
      { t: 0, label: "פתיחה" },
      { t: 132, label: "מה זה AI ואיך זה עובד?" },
      { t: 517, label: "מגבלות וסכנות" },
      { t: 915, label: "הנחיות משה\"ח" },
      { t: 1310, label: "מודלים לעומת כלים שיושבים עליהם" },
      { t: 1691, label: "Magic School" },
      { t: 2013, label: "Claude" },
      { t: 3490, label: "ניתוח קבצים בקלוד" },
      { t: 4100, label: "PI AI" },
      { t: 4260, label: "תמונות בבינג" },
      { t: 4623, label: "פלייגראונד" },
      { t: 5400, label: "שאלות ותשובות" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-gs-1", "מה כדאי לפני שמכניסות כלי לכיתה?", ["רק לבחור את הכלי הכי חדש", "להבין מגבלות ולהציץ בהנחיות המשרד", "לתת לתלמידות חשבון פרטי"], 1),
      quiz("q-gs-2", "איך משתמשים בפרקים בסרטון הארוך?", ["חייבים לראות הכל ברצף", "קופצות לקטע שרלוונטי עכשיו", "הפרקים רק ליוטיוב במחשב"], 1),
    ],
  },
  {
    id: "lesson-gemini-notebook",
    capabilityId: "cap-gemini-notebook",
    title: "חומרי למידה בנוטבוק LM",
    body: "<p>מוסיפות מקורות, מארגנות בתגיות, ואז מבקשות מערך פעיל — לא רק סיכום.</p><p>הכלי טוב כשחשוב לכן לראות מאיפה הגיע כל משפט.</p>",
    videoUrl: embed("VYKyDIFgAtk"),
    chapters: [
      { t: 0, label: "מבוא ושיטת העבודה" },
      { t: 54, label: "הוספת מקורות וחיפוש ברשת" },
      { t: 112, label: "סינון מקורות ותגיות" },
      { t: 150, label: "הגדרות המחברת" },
      { t: 176, label: "מערך שיעור פעיל" },
      { t: 262, label: "מעקב אחר מקורות" },
      { t: 291, label: "טקסטים לתחנות ומשימות" },
      { t: 351, label: "למה נוטבוק ולא כלי אחר" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-nb-1", "מה השלב הראשון בנוטבוק?", ["ישר לבקש תמונה", "להוסיף מקורות ולסנן אותם", "לשתף עם כל בית הספר"], 1),
      quiz("q-nb-2", "מה מבקשות אחרי שיש מקורות?", ["סיסמה חדשה", "מערך פעיל שמתאים לכיתה", "מחיקת המחברת"], 1),
    ],
  },
  {
    id: "lesson-gemini-work",
    capabilityId: "cap-gemini-worksheets",
    title: "דפי עבודה מנוטבוק",
    body: "<p>מדביקות טקסט כמקור, מבקשות בסטודיו דף A4 או כרטיסיות להדפסה בשחור־לבן.</p><p>כדאי לכתוב בהנחיה איך לחלק את הדף ומה השאלות. אם העמוד נשבר — מנסות שוב בניסוח מדויק יותר.</p>",
    videoUrl: embed("a9PFBRk27ns"),
    chapters: [
      { t: 0, label: "המטרה: כרטיסיות ודפים להדפסה" },
      { t: 30, label: "הדבקת תוכן כמקור" },
      { t: 63, label: "הנחיית עיצוב בסטודיו" },
      { t: 142, label: "דוגמה: כרטיסיות" },
      { t: 174, label: "הפרומפט המדויק" },
      { t: 193, label: "חלוקת עמודים מורכבת" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-ws-1", "מאיפה מגיע התוכן לדף?", ["מהמחוון של Classroom", "ממקור שהדבקתן או העליתן למחברת", "רק מתמונת פרופיל"], 1),
      quiz("q-ws-2", "מה כדאי לכתוב בהנחיה?", ["רק «תעשי יפה»", "חלוקת דף, סוג השאלות ופורמט הדפסה", "את סיסמת בית הספר"], 1),
    ],
  },
  {
    id: "lesson-gemini-async",
    capabilityId: "cap-gemini-async",
    title: "יחידה א־סינכרונית עם נוטבוק",
    body: "<p>יחידה שהתלמידות יכולות לעשות בזמן שלהן: מצגת, משימה, משחק וטופס.</p><p>הסרטון ארוך ומחולק לפרקים — מתכנון המתווה ועד Forms ומשחק ב־Gemini Canvas. בחרו שני פרקים ליישום השבוע, לא את כולם.</p>",
    videoUrl: embed("w2CTh_BikV0"),
    chapters: [
      { t: 0, label: "מבוא: יחידה א־סינכרונית" },
      { t: 64, label: "סקירת כלים" },
      { t: 136, label: "כניסה לנוטבוק" },
      { t: 183, label: "פתיחת מחברת" },
      { t: 252, label: "ניהול מקורות" },
      { t: 375, label: "צ'אט מול סטודיו" },
      { t: 424, label: "מתווה למצגת" },
      { t: 609, label: "טיוב מקורות" },
      { t: 694, label: "עיצוב המצגת" },
      { t: 918, label: "ספר סגנונות" },
      { t: 1066, label: "פעילות בקבוצות" },
      { t: 1230, label: "משחוק" },
      { t: 1339, label: "Gemini Canvas" },
      { t: 1764, label: "הטמעה בסייטס" },
      { t: 2271, label: "עריכת שקפים" },
      { t: 2693, label: "דפי עבודה" },
      { t: 2760, label: "חומר פתוח" },
      { t: 2994, label: "טופס עם ניקוד" },
      { t: 3541, label: "סיכום" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-asyn-1", "מה עושים קודם — מצגת או מתווה?", ["ישר מצגת צבעונית", "מתווה (outline) ואחר כך עיצוב", "קודם טופס ציונים"], 1),
      quiz("q-asyn-2", "איך כדאי לצפות בסרטון הארוך?", ["רק בסוף החופשה ברצף", "לבחור פרקים ליישום השבוע", "בלי לעצור, גם בלי מחברת"], 1),
    ],
  },
  {
    id: "lesson-gemini-vids",
    capabilityId: "cap-gemini-vids",
    title: "סרטון בגוגל וידס",
    body: "<p>בחשבון הארגוני אפשר לפתוח פרויקט מהדרייב, להעלות חומרים ולתזמן כתוביות וסצנות.</p><p>בסוף מייצאות לדרייב. כדאי תסריט קצר וברור — הבינה עובדת טוב יותר ככה.</p>",
    videoUrl: embed("pTln0rmd29k"),
    chapters: [
      { t: 0, label: "עריכת רכיבים בסרטון" },
      { t: 47, label: "תזמון אובייקטים" },
      { t: 80, label: "כתוביות אוטומטיות" },
      { t: 150, label: "פרויקט חדש מהדרייב" },
      { t: 210, label: "העלאת חומרים ודמויות" },
      { t: 345, label: "תצוגה מקדימה וסצנות" },
      { t: 440, label: "תסריט לבינה" },
      { t: 515, label: "ייצוא לדרייב" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-vid-1", "מאיפה נוח לפתוח פרויקט וידס?", ["מתיבת הספאם", "מדרייב של בית הספר", "רק מהטלפון הפרטי"], 1),
      quiz("q-vid-2", "מה עוזר לבינה בסרטון?", ["תסריט קצר וברור", "רק מוזיקה חזקה", "שם קובץ באנגלית בלבד"], 0),
    ],
  },
  {
    id: "lesson-forms-ai",
    capabilityId: "cap-forms-ai",
    title: "בינה יוצרת טופס",
    body: "<p>אפשר לתת לבינה לנסח שאלון, ואז לעבור שאלה־שאלה בפורמס.</p><p>אם התוצאה חלשה — מנסות במודל חזק יותר (לא רק Flash) וכותבות במפורש: סוג השאלות, מספר, ומה נחשב נכון.</p>",
    videoUrl: embed("4TQ8xXBw3XY"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-fa-1", "מה עושות אחרי שהבינה יצרה טופס?", ["מפרסמות בלי קריאה", "עוברות על השאלות ומתקנות", "מוחקות את הכיתה"], 1),
      quiz("q-fa-2", "מה כדאי לכתוב לבקשה?", ["רק «טופס»", "סוג השאלות, כמה, ולמי זה מיועד", "את רשימת התלמידות"], 1),
    ],
  },
  {
    id: "lesson-forms-export",
    capabilityId: "cap-forms-export",
    title: "ייצוא טופס למסמך",
    body: "<p>לפעמים צריך את השאלות במסמך — להדפסה, לוועדה, או לעריכה מחוץ לפורמס.</p><p>בסרטון תראו ייצוא. אחריו בודקות שהמסמך מכיל את כל השאלות לפני שמשתפות.</p>",
    videoUrl: embed("53RQ5sLYgkk"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-fe-1", "למה לייצא טופס למסמך?", ["כדי למחוק את הטופס", "להדפסה, תיעוד או עריכה מחוץ לפורמס", "כדי לשנות סיסמה"], 1),
      quiz("q-fe-2", "מה בודקות אחרי הייצוא?", ["שרק הכותרת עברה", "שכל השאלות במסמך", "שהסרטון נמחק"], 1),
    ],
  },
  {
    id: "lesson-drive-folders",
    capabilityId: "cap-drive-folders",
    title: "ענן ועץ תיקיות",
    body: "<p>כשאין מקום קבוע לקבצים — דברים נעלמים. תיקיות לפי מקצוע ושכבה חוסכות חיפוש.</p><p>הסרטון ישן בסגנון, הרעיון נשאר: סביבת עבודה אחת, שמות ברורים, ולא «על שולחן העבודה בבית».</p>",
    videoUrl: embed("vWFWX4e8Dhk"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-df-1", "מה הסימן שסביבת העבודה לא מסודרת?", ["יש יותר מדי תלמידות", "קבצים נעלמים ואין מקום קבוע לשים משהו", "הכיתה בצבע צהוב"], 1),
      quiz("q-df-2", "איך מתחילות לסדר?", ["תיקיות לפי מקצוע ושכבה, שמות ברורים", "כל הקבצים בשורש הדרייב", "רק בוואטסאפ"], 0),
    ],
  },
  {
    id: "lesson-drive-share",
    capabilityId: "cap-drive-share",
    title: "מסמך שיתופי בדוקס",
    body: "<p>פותחות מסמך, לוחצות שיתוף, ובוחרות מי צופה ומי עורכת.</p><p>לכיתה — בדרך כלל «כל מי שיש לו את הקישור יכול לצפות», ולעמיתה — עריכה. לא שולחות קובץ בוואטסאפ כשאפשר קישור חי.</p>",
    videoUrl: embed("5j-JPPZAoYc"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-ds-1", "איך משתפות דוק עם עמיתה?", ["מורידות ושולחות בוואטסאפ", "שיתוף עם הרשאת עריכה", "מדפיסות ומעבירות במסדרון"], 1),
      quiz("q-ds-2", "מה ההבדל בין צפייה לעריכה?", ["אין הבדל", "צפייה רואה בלבד, עריכה יכולה לשנות", "עריכה מוחקת את הקובץ"], 1),
    ],
  },
  {
    id: "lesson-meet-share",
    capabilityId: "cap-meet-share",
    title: "שיתוף מסך ב־Meet",
    body: "<p>אפשר לשתף חלון אחד במקום את כל המסך — אז לא רואים התראות פרטיות.</p><p>בסרטון: איך לשתף ועדיין לראות תלמידות, איך לעבור בין מסכים, ואיך לדאוג שיהיה גם שמע.</p>",
    videoUrl: embed("n5nqHPX0KX8"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-ms-1", "מה בטוח יותר לשתף?", ["את כל המסך תמיד", "חלון אחד של המצגת או הדפדפן", "את תיקיית התמונות"], 1),
      quiz("q-ms-2", "מה עוד לבדוק בשיתוף סרטון?", ["שרק הווידאו רץ בלי שמע, זה מספיק", "שיש גם שמע אם צריך", "לכבות את המצלמה של כולן"], 1),
    ],
  },
  {
    id: "lesson-meet-beyond",
    capabilityId: "cap-meet-beyond",
    title: "למידה מרחוק — לא רק וידאו",
    body: "<p>מפגש חי הוא כלי אחד. אפשר גם משימה במרחב, הודעה, וחומר לצפייה בזמן שלהן.</p><p>הסרטון מציע מודל אחר מ«כולן מול המצלמה כל השיעור».</p>",
    videoUrl: embed("Y7ENhiHvlcA"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-mb-1", "מה חסר אם יש רק מפגש וידאו?", ["כלום", "משימה ומרחב שהתלמידה יכולה לחזור אליהם", "עוד סיסמה"], 1),
      quiz("q-mb-2", "מתי מפגש חי הכי שווה?", ["לכל דף עבודה", "לשיחה, שאלות והבהרה — לא להקראת שקפים", "רק בלילה"], 1),
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
    capabilities: [...classroomCaps, ...extraCaps],
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
