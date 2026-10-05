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
  {
    id: "cap-video-vids",
    toolId: "meet",
    title: "יצירת סרטון בגוגל וידס",
    description: "להכין סרטון קצר לשיעור: תמונות, קריינות, ושיתוף עם הכיתה.",
    order: 1,
  },
  {
    id: "cap-video-photos",
    toolId: "meet",
    title: "שילוב תמונות בלמידה",
    description: "לבחור תמונה מתאימה ולהציג בשיעור, בלי להעמיס ובלי לצלם תלמידות שלא רוצות.",
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
    title: "איך פותחים כיתה ב־Classroom",
    body: "<p>נכנסים ל־classroom.google.com, לוחצים על + ובוחרים «צור כיתה». נותנים שם ברור (מקצוע + שכבה) ומאשרים.</p><p>הקוד יופיע בראש הכיתה. כדאי גם לבחור מקצוע ולהגדיר שהכיתה תישאר מסודרת לאורך השנה.</p>",
    videoUrl: embed("RtEmnhrNg70"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q1", "איפה מוצאים את קוד הכיתה אחרי הפתיחה?", ["בראש דף הכיתה, ליד שם הכיתה", "בהגדרות, תחת רשימת האנשים", "בכרטיס של כל תלמידה בנפרד"], 0),
      quiz("q2", "מה כדאי לכלול בשם הכיתה?", ["שם המורה והשנה, בלי המקצוע", "רק המקצוע, כי השכבה כבר ביומן", "מקצוע ושכבה, כדי שיהיה ברור של מי הכיתה"], 2),
    ],
  },
  {
    id: "lesson-class-materials",
    capabilityId: "cap-class-materials",
    title: "איך מעלים חומר לימוד לכיתה",
    body: "<p>בכיתה: «חומר הכיתה» → יוצרים חומר. מצרפים קובץ, קישור או מצגת — לא רק כמטלה עם תאריך.</p><p>הסרטון מראה גם מצגת רצף: דרך נוחה לשמור את החומר במקום אחד שהתלמידות מוצאות.</p>",
    videoUrl: embed("H7ABMS4CRN0"),
    chapters: [
      { t: 0, label: "מצגת רצף כמקום לחומר" },
      { t: 41, label: "בנייה ותוכן עניינים" },
      { t: 80, label: "קישור פעילויות וסרטונים" },
      { t: 101, label: "הטמעת מסמכים חיים" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-mat-1", "איפה שמים חומר קבוע לכיתה?", ["בחומר הכיתה, או במצגת רצף אחת", "במטלה עם תאריך, כדי שכולן יראו אותו", "בהודעה לכיתה, עם הקובץ מצורף"], 0),
      quiz("q-mat-2", "מתי בוחרים «חומר» ולא «מטלה»?", ["כשצריך הגשה וציון, גם בלי תאריך", "כשיש גם קריאה וגם תאריך הגשה באותו פריט", "כשהקובץ לקריאה, בלי הגשה ובלי ציון"], 2),
    ],
  },
  {
    id: "lesson-class-assignment",
    capabilityId: "cap-class-assignment",
    title: "איך יוצרים מטלה עם תאריך",
    body: "<p>בכיתה: «ליצור» → מטלה. כותבים הנחיה ברורה, קובעים תאריך הגשה, ומצרפים קובץ אם צריך.</p><p>«עותק לתלמידה» — רק כשכל אחת ממלאה מסמך משלה. הסרטון עובר גם מחוון; לשיעור הזה מספיק החלק של יצירת המטלה.</p>",
    videoUrl: embed("8x03F22A2Tc"),
    chapters: [
      { t: 167, label: "יצירת מטלה ועותק לתלמידים" },
      { t: 226, label: "מחוון — אם תרצו בהמשך" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-as-1", "מה חייב להיות במטלה?", ["נושא קצר בלי תאריך, כי התאריך כבר ביומן", "הנחיה ברורה, וגם תאריך הגשה", "מחוון מלא, גם אם ההנחיה עדיין כללית"], 1),
      quiz("q-as-2", "מתי «עותק לתלמידה»?", ["כשכל אחת ממלאה מסמך משלה", "כשכולן עורכות יחד את אותו מסמך", "כשמעלים קובץ לקריאה, בלי שמישהי תערוך"], 0),
    ],
  },
  {
    id: "lesson-class-quiz",
    capabilityId: "cap-jr1vh03",
    title: "בוחן בטופס — ידני או מבינה",
    body: "<p>אפשר לבנות טופס עם ניקוד ידנית, או לתת לבינה לנסח — ואז רק לוודא שתקין.</p><p>עוברים שאלה־שאלה: ניסוח, תשובה נכונה, ונקודות. לא מפרסמים בלי קריאה.</p>",
    videoUrl: embed("4TQ8xXBw3XY"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-qz-1", "מה חובה אחרי שבינה יצרה בוחן?", ["לפרסם לכיתה, ולתקן רק אם מישהי פונה", "לעבור על הניסוח, התשובה הנכונה והניקוד", "לשנות את הכותרת, ולסמוך על שאר הניסוח"], 1),
      quiz("q-qz-2", "מה כדאי לבקש מהבינה?", ["«תכיני טופס לכיתה», בלי סוג שאלות ומספר", "את שמות התלמידות, כדי שהשאלות יהיו אישיות", "סוג השאלות, כמה, ומה נחשב תשובה נכונה"], 2),
    ],
  },
  {
    id: "lesson-gem-companion",
    capabilityId: "cap-8g5a8i5",
    title: "GEM שמלווה משימה",
    body: "<p>ב־gemini.google.com → Gems → Gem חדש. שם, והוראות: מי הבוט, מה המשימה, ומה אסור לו לעשות במקום התלמידה.</p><p>לליווי עבודה / מצגת / מפת מושגים: לבקש שאלות מכוונות, לא מוצר מוכן. אין סרטון ייעודי ל־Gems בערוץ — כאן סרטון על בינה בכיתה, עם פרקים שימושיים.</p>",
    videoUrl: embed("NnsUdSOUhg4"),
    chapters: [
      { t: 132, label: "מה זה AI ואיך זה עובד?" },
      { t: 517, label: "מגבלות וסכנות" },
      { t: 915, label: "הנחיות משה\"ח" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-gc-1", "מה כותבים בהוראות ל־GEM מלווה?", ["שיהיה נחמד, ואם התלמידה תקועה — שישלים את המשימה במקומה", "מי הוא, מה המשימה, ושישאל במקום לכתוב במקומה", "רק את נושא השיעור, בלי גבול למה אסור לו לכתוב"], 1),
      quiz("q-gc-2", "מתי מצרפים קובץ ל־GEM?", ["כשיש דוגמה או הנחיות למשימה הזו", "לכל Gem, גם בלי קשר למשימה, כדי שיהיה עשיר יותר", "אחרי שהתלמידות סיימו, כארכיון של העבודות"], 0),
    ],
  },
  {
    id: "lesson-gem-skeptic",
    capabilityId: "cap-8ax8r35",
    title: "GEM שקרן — לאתגר ולברור טעויות",
    body: "<p>אותו מסך Gems, הוראות אחרות: הבוט טוען טענות, חלק נכונות וחלק לא. התלמידה מבררת לפי היחידה.</p><p>מגדירים חומר, רמת כיתה, ושיוחזר למשפט מהחומר. אחרי תשובה: רמז, לא פתרון מיד.</p>",
    videoUrl: embed("NnsUdSOUhg4"),
    chapters: [
      { t: 517, label: "מגבלות וסכנות" },
      { t: 915, label: "הנחיות משה\"ח" },
      { t: 1310, label: "מודלים לעומת כלים" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-gk-1", "מה התלמידה עושה מול בוט שקרן?", ["מסמנת מה שנשמע בטוח, ובודקת רק משפט שנראה מוזר", "מבררת לפי היחידה, לא לפי הביטחון של הבוט", "מבקשת את התשובה הסופית ומעתיקה אותה למחברת"], 1),
      quiz("q-gk-2", "מה חשוב בהוראות?", ["שיוסיף ידע כללי גם כשאין לזה מקור בחומר", "שיתקן מיד כל טעות, בלי לתת לה לנסות קודם", "שיישען על החומר שצירפתם, וירמוז לפני הפתרון"], 2),
    ],
  },
  {
    id: "lesson-gem-images",
    capabilityId: "cap-wdm3d0h",
    title: "בוט תמונות עם מאפיין קבוע",
    body: "<p>ב־GEM כותבים סגנון קבוע: קו, צבע, ומה אסור (פנים של תלמידות, לוגואים). התלמידה מבקשת נושא — הסגנון נשאר.</p><p>הסרטון מראה יצירת תמונה ב־GPT. העיקרון דומה; ב־GEM זה נשמר בהוראות במקום לכתוב כל פעם מחדש.</p>",
    videoUrl: embed("che4ANj6oFw"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-gi-1", "מה שם בהוראות בוט התמונות?", ["«תמונה יפה לשיעור», והסגנון נכתב מחדש בכל בקשה", "סגנון קבוע, ומה אסור לצייר", "את נושאי השיעור, בלי הגבלה על פנים או לוגואים"], 1),
      quiz("q-gi-2", "למה GEM ולא צ׳אט חדש כל פעם?", ["כי בצ׳אט אי אפשר לבקש תמונה", "כי Gem מדויק יותר, גם עם אותן הוראות בכל פעם", "הסגנון נשמר, והתלמידה רק מחליפה נושא"], 2),
    ],
  },
  {
    id: "lesson-nb-sources",
    capabilityId: "cap-c20gnnk",
    title: "נוטבוק: מקורות משלנו",
    body: "<p>פותחים מחברת, מוסיפים מקורות שלכם: טקסט, קובץ, קישור. מסננים ומתייגים לפני שמבקשים תוצר.</p><p>בלי מקורות טובים — אין חומר למידה שאפשר לסמוך עליו.</p>",
    videoUrl: embed("VYKyDIFgAtk"),
    chapters: [
      { t: 0, label: "מבוא ושיטת העבודה" },
      { t: 54, label: "הוספת מקורות וחיפוש ברשת" },
      { t: 112, label: "סינון מקורות ותגיות" },
      { t: 150, label: "הגדרות המחברת" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-ns-1", "מה השלב הראשון בנוטבוק?", ["לבקש מצגת, והמערכת כבר תביא מקורות", "להוסיף מקורות, לסנן ולתייג לפני תוצר", "לשתף את המחברת עם הכיתה, ורק אז להעלות חומר"], 1),
      quiz("q-ns-2", "למה לתייג מקורות?", ["כדי שהמחברת תיראה מסודרת, בלי קשר לתוצר", "כדי שהתלמידות יראו מי העלה כל קובץ", "כדי לבחור על אילו מקורות להישען בכל בקשה"], 2),
    ],
  },
  {
    id: "lesson-nb-slides",
    capabilityId: "cap-289yjjh",
    title: "מתווה ואז מצגת בנוטבוק",
    body: "<p>אחרי מקורות: מבקשים מתווה, מתקנים, ורק אז מעצבים מצגת.</p><p>אם שקף חלש — חוזרים למתווה או למקור, לא ממציאים שקפים מההתחלה.</p>",
    videoUrl: embed("w2CTh_BikV0"),
    chapters: [
      { t: 183, label: "פתיחת מחברת" },
      { t: 252, label: "ניהול מקורות" },
      { t: 424, label: "מתווה למצגת" },
      { t: 694, label: "עיצוב המצגת" },
      { t: 2271, label: "עריכת שקפים" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-nsl-1", "מה קודם — מצגת או מתווה?", ["מצגת מעוצבת, ואת התוכן מתקנים אחר כך על השקפים", "מתווה, תיקון, ורק אחר כך עיצוב", "קודם רקע וצבעים, כדי שהמתווה יישב על שקף יפה"], 1),
      quiz("q-nsl-2", "שקף לא מדויק — מה עושים?", ["משאירים אם הרעיון נכון, ומתקנים בעל פה בכיתה", "מוחקים את השקף ומבקשים מצגת חדשה מההתחלה", "חוזרים למתווה או למקור, ומתקנים משם"], 2),
    ],
  },
  {
    id: "lesson-nb-assess",
    capabilityId: "cap-8x5hu6g",
    title: "הערכה עם נוטבוק — בזהירות",
    body: "<p>מצרפים מחוון + מבחן או קבצי הגשה / מצגת שיתופית. מבקשים הערכה לפי המחוון בלבד.</p><p>בודקים בעצמכם: הנוטבוק יכול לפספס. לא ציון סופי בלי עיניים של מורה, ולא חומר רגיש בלי הרשאות בית ספר.</p>",
    videoUrl: embed("w2CTh_BikV0"),
    chapters: [
      { t: 252, label: "ניהול מקורות" },
      { t: 2994, label: "טופס עם ניקוד" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-na-1", "מה חייב להיות במחברת לפני הערכה?", ["שם הכיתה ורשימת התלמידות, בלי המחוון", "המחוון, וגם העבודות או המבחן", "המחוון לבד, והעבודות נשארות אצל המורה"], 1),
      quiz("q-na-2", "אפשר לשים ציון ישר מהנוטבוק?", ["כן, אם המחוון היה ברור והנוטבוק ציטט ממנו", "רק כשאין מחוון, כי אז השיפוט שלו חופשי יותר", "לא כציון סופי — בודקים בעצמנו, בעיקר במהימנות ובחומר רגיש"], 2),
    ],
  },
  {
    id: "lesson-canvas-game",
    capabilityId: "cap-76fu2bw",
    title: "משחק מקרן בקנבס",
    body: "<p>בג׳מיני קנבס מבקשים משחק לכיתה: ניקוד לפי קבוצות, וסוג (חידון, מירוץ, התאמה).</p><p>מציגים במקרן. בודקים שמתאים לגיל ושאין תוכן מומצא. הסרטון ארוך — קפצו לפרק Canvas.</p>",
    videoUrl: embed("w2CTh_BikV0"),
    chapters: [
      { t: 1230, label: "משחוק: פרומפט למשחק" },
      { t: 1339, label: "Gemini Canvas" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-cg-1", "מה מגדירים במשחק מקרן?", ["צבעים ומוזיקה, והשאלות נלקחות לבד מהשיעור", "סוג המשחק, וניקוד לפי קבוצות", "רק כמה קבוצות יש, בלי לבחור סוג משחק"], 1),
      quiz("q-cg-2", "לפני שמקרינים — מה בודקים?", ["שהמשחק נפתח ורץ, בלי לקרוא את השאלות", "שיש ניקוד ומוזיקה, גם אם שאלה יצאה מהחומר", "שהשאלות מהחומר שצירפתם, ומתאימות לגיל"], 2),
    ],
  },
  {
    id: "lesson-canvas-lomda",
    capabilityId: "cap-64hl5j6",
    title: "לומדה בקנבס עם מסך סיום",
    body: "<p>פעילות שהתלמידה עושה לבד: שלבים, תמונות או סרטונים, ומשוב.</p><p>בסוף — מסך סיום שהיא שולחת אליכם (צילום או קישור) עם ההישג. בלי זה קשה לדעת מי סיימה.</p>",
    videoUrl: embed("w2CTh_BikV0"),
    chapters: [
      { t: 1066, label: "פעילות א־סינכרונית" },
      { t: 1339, label: "Gemini Canvas" },
      { t: 1764, label: "הטמעה בסייטס" },
    ],
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-cl-1", "מה חסר בלומדה בלי מסך סיום?", ["כלום, כי ההתקדמות כבר נשמרת באמצע הדרך", "דרך לראות מי סיימה, ומה ההישג", "קישור למורה, כי בלי זה אי אפשר לשתף את הלומדה"], 1),
      quiz("q-cl-2", "איך משתפים?", ["מקרינים במקרן, וכולן עוברות את הלומדה יחד", "שולחים את הקובץ בוואטסאפ, בלי קישור", "קישור לתלמידה, והיא שולחת את מסך הסיום"], 2),
    ],
  },
  {
    id: "lesson-video-vids",
    capabilityId: "cap-video-vids",
    title: "איך יוצרים סרטון בגוגל וידס",
    body: "<p>בגוגל וידס בונים סרטון קצר: תמונות או שקפים, קריינות, ומוזיקה עדינה.</p><p>שומרים ומשתפים קישור עם הכיתה. בודקים שהתמונות מותרות — בלי פנים של תלמידות שלא רוצות.</p>",
    videoUrl: embed("pTln0rmd29k"),
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-vid-1", "למה מתאים גוגל וידס כאן?", ["לישיבת צוות מצולמת, במקום מיט", "לסרטון קצר לשיעור, שאפשר לשתף בקישור", "להחלפת תמונת הנושא של הכיתה בסרטון רקע"], 1),
      quiz("q-vid-2", "מה בודקים לפני שיתוף?", ["שהמוזיקה והקריינות ברורות, גם אם יש פנים של תלמידות", "שרק הכותרת קצרה, ואת התמונות בודקים אחרי השיתוף", "שהתמונות מותרות, ואין צילום של מי שלא רוצה להופיע"], 2),
    ],
  },
  {
    id: "lesson-video-photos",
    capabilityId: "cap-video-photos",
    title: "תמונות שמשרתות את השיעור",
    body: "<p>בוחרים תמונה אחת ברורה שתומכת ברעיון — לא גלריה ארוכה.</p><p>חותכים למה שחשוב, כותבים כיתוב קצר, ולא מעלים תמונות של תלמידות שלא ביקשו להופיע.</p>",
    autoCompleteOnQuiz: true,
    quiz: [
      quiz("q-ph-1", "כמה תמונות עדיף בשיעור אחד?", ["כמה שיותר, כדי שלכל רעיון תהיה המחשה", "מעט, וכל תמונה עם תפקיד ברור", "תמונה אחת גדולה לאורך השיעור, גם בלי קשר לנושא"], 1),
      quiz("q-ph-2", "מתי לא משתמשים בצילום?", ["כשהוא יפה, גם אם הקשר לנושא רק עקיף", "כשיש בו תלמידה שלא רוצה להופיע", "כשצולם בבית הספר, גם אם ביקשו להופיע"], 1),
    ],
  },
];

const meetings: Meeting[] = [
  {
    id: "meet-classroom-evening",
    title: "ערב צוות: Classroom למתחילים",
    topic: "אוריינות דיגיטלית",
    datetime: "2026-09-16T19:30:00",
    location: "חדר מורים",
    description: "נתנסה יחד בפתיחת כיתה, הזמנה ומטלה ראשונה. מי שכבר שולט מוזמן להצטרף כמלווה.",
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
  { id: "expert", title: "מומחה", description: "שולט ב־{current} מתוך {target} יכולות", icon: "award", metric: "mastered", target: 10 },
  { id: "doer", title: "מיישם", description: "העלית {current} מתוך {target} תוצרים", icon: "package", metric: "hasProduct", target: 6 },
  { id: "mentor", title: "מלמד", description: "מוכן ללמד {current} מתוך {target} יכולות", icon: "heart-handshake", metric: "readyToTeach", target: 1 },
  { id: "first", title: "ראשון בשער", description: "מילאת את הטופס — {current} מתוך {target}", icon: "flag", metric: "anyMarked", target: 1 },
  { id: "curious", title: "סקרן", description: "שמרת {current} מתוך {target} פריטים", icon: "bookmark", metric: "savedForLater", target: 3 },
];

const settings: Settings = {
  adminEmails: ADMIN_EMAILS,
  praiseNote: "השבוע שווה לפרגן למי שכבר מוכן ללמד עמית, ולמי שהעז לסמן «רוצה ללמוד».",
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
    wishes: [],
    badges,
    classrooms: [],
    subjects: [],
    settings,
  };
}
