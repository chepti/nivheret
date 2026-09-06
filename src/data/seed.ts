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
    description: "ליצור כיתה, לתת לה שם ולשייך מקצוע.\nהזמנת תלמידות ומורים, לפרסם עדכון שכל התלמידות רואות. \nהגדרת הכיתה כך שתישאר מסודרת",
    order: 1,
  },
  {
    id: "cap-class-materials",
    toolId: "classroom",
    title: "העלאת חומרי לימוד",
    description: "לצרף קובץ, קישור או מצגת לחומר הכיתה. \nארגון בנושאים",
    order: 4,
  },
  {
    id: "cap-class-assignment",
    toolId: "classroom",
    title: "יצירת מטלה",
    description: "ליצור מטלה עם תאריך הגשה והנחיה ברורה.\nלבדוק עבודה, להחזיר הערה ולתת ציון.",
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
    title: "פתיחת כיתה, הזמנה וסדר",
    body: "<p>פותחות כיתה, נותנות שם (מקצוע + שכבה), מזמינות תלמידות ומורות, ומפרסמות הודעת פתיחה.</p><p>הקוד בראש הכיתה. כדאי גם באנר והגדרות תגובה — כדי שהכיתה תישאר קריאה לאורך השנה.</p><p>אפשר לקפוץ בפרקים: דף הבית, באנר, הודעה, ואז חומר ראשון.</p>",
    videoUrl: embed("8x03F22A2Tc"),
    chapters: [
      { t: 0, label: "דף הבית החדש" },
      { t: 44, label: "עיצוב באנר לכיתה" },
      { t: 89, label: "הודעת פתיחה והגדרות תגובה" },
      { t: 142, label: "הוספת מצגת רצף שנתית" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-open-1", "איפה מוצאים את קוד הכיתה?", ["בהגדרות החשבון", "בראש דף הכיתה", "בתיבת הדואר"], 1),
      quiz("q-open-2", "מה עוזר לכיתה להישאר מסודרת?", ["רק צבע אקראי", "שם ברור, הודעת פתיחה והגדרות תגובה", "בלי כותרת בכלל"], 1),
    ],
  },
  {
    id: "lesson-class-invite",
    capabilityId: "cap-class-open",
    title: "איך מתחילים ב־Classroom",
    body: "<p>אם זו הפעם הראשונה: כניסה, פתיחת מרחב, משימה ראשונה והוספת תלמידות.</p><p>אפשר קוד, קישור, או הוספה בלשונית האנשים. גם מורה עמיתה נכנסת משם.</p>",
    videoUrl: embed("RtEmnhrNg70"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-inv-1", "איך תלמידה מצטרפת עם קוד?", ["כותבת במייל למורה", "לוחצת + ובוחרת «הצטרפי לכיתה»", "פותחת Drive"], 1),
      quiz("q-inv-2", "איפה מוסיפים מורה שותפה?", ["רק בווטסאפ", "בלשונית האנשים", "בהגדרות הדפדפן"], 1),
    ],
  },
  {
    id: "lesson-class-materials",
    capabilityId: "cap-class-materials",
    title: "חומר לימוד וארגון בנושאים",
    body: "<p>מצרפות קובץ, קישור או מצגת לחומר הכיתה — לא רק כמטלה.</p><p>מצגת רצף אחת עם תוכן עניינים שומרת נושאים ברורים לאורך השנה, ואפשר להטמיע מסמכים חיים.</p>",
    videoUrl: embed("H7ABMS4CRN0"),
    chapters: [
      { t: 0, label: "הרעיון למצגת רצף שנתית" },
      { t: 41, label: "בנייה ותוכן עניינים" },
      { t: 80, label: "קישור פעילויות וסרטונים" },
      { t: 101, label: "הטמעת מסמכים חיים" },
      { t: 308, label: "ארגון נושאים עם כותרות" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-mat-1", "איפה שמים חומר קבוע?", ["רק במייל", "בחומר הכיתה או במצגת רצף", "רק במחשב בבית"], 1),
      quiz("q-mat-2", "מה עוזר לארגן בנושאים?", ["בלי שמות", "תוכן עניינים וכותרות בולטות", "רק צבע אקראי"], 1),
    ],
  },
  {
    id: "lesson-class-assignment",
    capabilityId: "cap-class-assignment",
    title: "מטלה, מחוון ובדיקה",
    body: "<p>מטלה: הנחיה, תאריך, ועותק לתלמידה כשצריך.</p><p>אפשר מחוון — גם בעזרת AI — ואז לערוך קריטריונים. משם בודקות, כותבות הערה ונותנות ציון.</p>",
    videoUrl: embed("8x03F22A2Tc"),
    chapters: [
      { t: 167, label: "יצירת מטלה ועותק לתלמידים" },
      { t: 226, label: "יצירת מחוון ב-AI" },
      { t: 285, label: "עריכת קריטריונים וניקוד" },
      { t: 342, label: "בדיקת עבודות וסיכום" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-as-1", "מתי «עותק לתלמידים»?", ["תמיד, גם בהודעה", "כשכל אחת ממלאה את המסמך שלה", "רק בלי תאריך"], 1),
      quiz("q-as-2", "מה עושים אחרי מחוון מ-AI?", ["שולחים בלי קריאה", "עורכות קריטריונים לפי מה שבאמת בודקות", "מוחקות את המטלה"], 1),
    ],
  },
  {
    id: "lesson-class-quiz",
    capabilityId: "cap-jr1vh03",
    title: "בוחן בפורמס — ידני או מבינה",
    body: "<p>אפשר לבנות טופס עם ניקוד ידנית, או לתת לבינה לנסח — ואז רק לוודא שתקין.</p><p>עוברות שאלה־שאלה: ניסוח, תשובה נכונה, ונקודות. לא מפרסמות בלי קריאה.</p>",
    videoUrl: embed("4TQ8xXBw3XY"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-qz-1", "מה חובה אחרי שבינה יצרה בוחן?", ["מפרסמות מיד", "עוברות על השאלות והניקוד", "מוחקות את הכיתה"], 1),
      quiz("q-qz-2", "מה כדאי לבקש מהבינה?", ["רק «טופס»", "סוג השאלות, כמה, ומה נחשב נכון", "את רשימת התלמידות"], 1),
    ],
  },
  {
    id: "lesson-gem-companion",
    capabilityId: "cap-8g5a8i5",
    title: "GEM שמלווה משימה",
    body: "<p>ב־gemini.google.com → Gems → Gem חדש. נותנות שם, וכותבות הוראות: מי הבוט, מה המשימה, ומה אסור לו לעשות במקום התלמידה.</p><p>לליווי עבודה / מצגת / מפת מושגים: לבקש שאלות מכוונות, לא מוצר מוכן. אפשר לצרף קובץ דוגמה.</p><p>אין בערוץ סרטון ייעודי ל־Gems — הסרטון כאן על בינה בכיתה, עם פרקים. הקפיצה הרלוונטית: איך ניגשים לכלי ומה לבדוק לפני שמשתפות עם תלמידות.</p>",
    videoUrl: embed("NnsUdSOUhg4"),
    chapters: [
      { t: 132, label: "מה זה AI ואיך זה עובד?" },
      { t: 517, label: "מגבלות וסכנות" },
      { t: 915, label: "הנחיות משה\"ח" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-gc-1", "מה כותבות בהוראות ל־GEM מלווה?", ["רק «תהיי נחמדה»", "מי הוא, מה המשימה, ושישאל במקום לעשות במקומן", "את סיסמת הכיתה"], 1),
      quiz("q-gc-2", "מתי מצרפים קובץ ל־GEM?", ["אף פעם", "כשיש דוגמה או הנחיות למשימה הספציפית", "רק תמונת פרופיל"], 1),
    ],
  },
  {
    id: "lesson-gem-skeptic",
    capabilityId: "cap-8ax8r35",
    title: "GEM שקרן — לאתגר ולברור טעויות",
    body: "<p>אותו מסך Gems, הוראות אחרות: הבוט טוען טענות, חלק נכונות וחלק לא. התלמידה צריכה לברור.</p><p>מגדירות יחידת חומר, רמת כיתה, ושיוחזר למשפט מהחומר — לא להמציא עובדות. אחרי תשובה: רמז, לא פתרון מיד.</p><p>הסרטון הכללי על בינה בכיתה עוזר לחשוב על מגבלות לפני שמשחררות בוט כזה לכיתה.</p>",
    videoUrl: embed("NnsUdSOUhg4"),
    chapters: [
      { t: 517, label: "מגבלות וסכנות" },
      { t: 915, label: "הנחיות משה\"ח" },
      { t: 1310, label: "מודלים לעומת כלים" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-gk-1", "מה התלמידה עושה מול בוט שקרן?", ["מעתיקה כל משפט", "מבררת מה נכון לפי היחידה", "מכבה את המחשב"], 1),
      quiz("q-gk-2", "מה חשוב בהוראות?", ["שימציא בחופשיות", "שיישען על החומר שצירפתן, וירמוז לפני הפתרון", "שיחליף את המבחן"], 1),
    ],
  },
  {
    id: "lesson-gem-images",
    capabilityId: "cap-wdm3d0h",
    title: "בוט תמונות עם מאפיין קבוע",
    body: "<p>ב־GEM כותבות סגנון קבוע: קו, צבע, מה אסור (פנים של תלמידות, לוגואים). התלמידה מבקשת נושא — הסגנון נשאר.</p><p>בסרטון תראו יצירת תמונה ב־GPT. העיקרון דומה: פרומפט ברור + מאפיין שחוזר. ב־GEM זה נשמר בהוראות במקום לכתוב כל פעם מחדש.</p>",
    videoUrl: embed("che4ANj6oFw"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-gi-1", "מה שם בהוראות בוט התמונות?", ["רק «תעשי יפה»", "סגנון קבוע ומה אסור לצייר", "רשימת ציונים"], 1),
      quiz("q-gi-2", "למה GEM ולא צ'אט חדש כל פעם?", ["אין הבדל", "המאפיין נשמר, והתלמידה רק מחליפה נושא", "כי אסור צ'אט"], 1),
    ],
  },
  {
    id: "lesson-nb-sources",
    capabilityId: "cap-c20gnnk",
    title: "נוטבוק: מקורות משלנו",
    body: "<p>פותחות מחברת, מוסיפות מקורות שלכן: טקסט, קובץ, קישור. מסננות ומתייגות לפני שמבקשות תוצר.</p><p>בלי מקורות טובים — אין חומר למידה שאפשר לסמוך עליו.</p>",
    videoUrl: embed("VYKyDIFgAtk"),
    chapters: [
      { t: 0, label: "מבוא ושיטת העבודה" },
      { t: 54, label: "הוספת מקורות וחיפוש ברשת" },
      { t: 112, label: "סינון מקורות ותגיות" },
      { t: 150, label: "הגדרות המחברת" },
      { t: 262, label: "מעקב אחר מקורות" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-ns-1", "מה השלב הראשון בנוטבוק?", ["ישר לבקש מצגת", "להוסיף מקורות ולסנן", "לשתף עם כל בית הספר"], 1),
      quiz("q-ns-2", "למה לתייג מקורות?", ["רק ליופי", "כדי לארגן ולבחור במה להישען", "כדי למחוק את המחברת"], 1),
    ],
  },
  {
    id: "lesson-nb-slides",
    capabilityId: "cap-289yjjh",
    title: "מתווה ואז מצגת בנוטבוק",
    body: "<p>אחרי מקורות: מבקשות מתווה (outline), מתקנות, ורק אז מעצבות מצגת.</p><p>אפשר לבחור סגנון. אם שקף חלש — חוזרות למתווה, לא ממציאות שקפים ביד מההתחלה.</p>",
    videoUrl: embed("w2CTh_BikV0"),
    chapters: [
      { t: 183, label: "פתיחת מחברת" },
      { t: 252, label: "ניהול מקורות" },
      { t: 375, label: "צ'אט מול סטודיו" },
      { t: 424, label: "מתווה למצגת" },
      { t: 609, label: "טיוב מקורות" },
      { t: 694, label: "עיצוב המצגת" },
      { t: 918, label: "ספר סגנונות" },
      { t: 2271, label: "עריכת שקפים" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-nsl-1", "מה קודם — מצגת או מתווה?", ["ישר מצגת צבעונית", "מתווה, תיקון, ואז עיצוב", "קודם טופס ציונים"], 1),
      quiz("q-nsl-2", "שקף לא מדויק — מה עושות?", ["משאירות", "חוזרות למתווה או למקור ומתקנות", "מוחקות את המחברת"], 1),
    ],
  },
  {
    id: "lesson-nb-assess",
    capabilityId: "cap-8x5hu6g",
    title: "הערכה עם נוטבוק — בזהירות",
    body: "<p>מצרפות מחוון + מבחן או קבצי הגשה / מצגת שיתופית. מבקשות הערכה לפי המחוון בלבד.</p><p>בודקות בעצמכן: הנוטבוק יכול לפספס או להמציא. לא ציון סופי בלי עיניים של מורה. לא מעלות חומר רגיש בלי הרשאות בית ספר.</p><p>בסרטון על יחידה א־סינכרונית יש גם קטע על טופס עם ניקוד — כלי עזר, לא תחליף לבדיקה.</p>",
    videoUrl: embed("w2CTh_BikV0"),
    chapters: [
      { t: 252, label: "ניהול מקורות" },
      { t: 2994, label: "טופס עם ניקוד" },
      { t: 3541, label: "סיכום" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-na-1", "מה חייב להיות במחברת לפני הערכה?", ["רק שם הכיתה", "מחוון והעבודות או המבחן", "רק תמונת נושא"], 1),
      quiz("q-na-2", "אפשר לשים ציון ישר מהנוטבוק?", ["כן, תמיד", "לא — המורה מאשרת, במיוחד באבטחה ומהימנות", "רק אם אין מחוון"], 1),
    ],
  },
  {
    id: "lesson-canvas-game",
    capabilityId: "cap-76fu2bw",
    title: "משחק מקרן בקנבס",
    body: "<p>בג'מיני קנבס מבקשות משחק לכיתה: ניקוד לפי קבוצות, סוג (חידון, מירוץ, התאמה).</p><p>מציגות במקרן, לא לשליחה הביתה. בודקות שמתאים לגיל ושאין תוכן מומצא מהחומר.</p><p>בסרטון — פרק Gemini Canvas, ואפשר גם ארטיפקט מהיר אם רוצות גרסה קצרה יותר.</p>",
    videoUrl: embed("w2CTh_BikV0"),
    chapters: [
      { t: 1230, label: "משחוק: פרומפט למשחק" },
      { t: 1339, label: "Gemini Canvas" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-cg-1", "מה מגדירות במשחק מקרן?", ["רק צבע", "סוג המשחק וניקוד לפי קבוצות", "סיסמת מייל"], 1),
      quiz("q-cg-2", "לפני שמקרינות — מה בודקות?", ["כלום", "שהשאלות מהחומר שלכן ומתאימות לגיל", "שרק יש מוזיקה"], 1),
    ],
  },
  {
    id: "lesson-canvas-lomda",
    capabilityId: "cap-64hl5j6",
    title: "לומדה בקנבס עם מסך סיום",
    body: "<p>פעילות שהתלמידה עושה לבד: שלבים, תמונות/סרטונים, ומשוב.</p><p>בסוף — מסך סיום שהיא שולחת אליכן (צילום או קישור) עם ההישג. בלי זה קשה לדעת מי סיימה.</p>",
    videoUrl: embed("w2CTh_BikV0"),
    chapters: [
      { t: 1066, label: "פעילות א־סינכרונית" },
      { t: 1230, label: "משחוק" },
      { t: 1339, label: "Gemini Canvas" },
      { t: 1764, label: "הטמעה בסייטס" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-cl-1", "מה חסר בלומדה בלי מסך סיום?", ["כלום", "דרך לראות שהתלמידה סיימה ומה ההישג", "רק צבע"], 1),
      quiz("q-cl-2", "איך משתפות?", ["רק על המקרן תמיד", "קישור לתלמידה, והיא שולחת את מסך הסיום", "רק בוואטסאפ כקובץ כבד"], 1),
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
