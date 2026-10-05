import { useEffect, useRef, useState } from "react";
import { Bold, Heading2, ImagePlus, Italic, Link, List, ListOrdered, Underline } from "lucide-react";
import { sanitizeHtml } from "../lib/html";
import { prepareLessonImage, uploadLessonImage } from "../lib/media";

type Props = {
  value: string;
  onChange: (html: string) => void;
  lessonId: string;
};

export function RichTextEditor({ value, onChange, lessonId }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const last = useRef(value);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.innerHTML = value || "";
    last.current = value;
    // נטען פעם אחת. עדכון מההקלדה לא מחזיר את ה־HTML, כדי שרווח ושורה לא יימחקו.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const emit = () => {
    const el = box.current;
    if (!el) return;
    const html = sanitizeHtml(el.innerHTML);
    if (html === last.current) return;
    last.current = html;
    onChange(html);
  };

  const run = (cmd: string, arg?: string) => {
    box.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };

  const addLink = () => {
    const href = window.prompt("כתובת הקישור", "https://");
    if (!href) return;
    run("createLink", href);
  };

  const insertImage = async (file: File) => {
    setBusy(true);
    try {
      const prepared = await prepareLessonImage(file);
      let src = prepared;
      try {
        src = await uploadLessonImage(lessonId, prepared);
      } catch {
        src = prepared;
      }
      box.current?.focus();
      document.execCommand("insertHTML", false, `<img src="${src}" alt="">`);
      emit();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rich-wrap">
      <div className="rich-bar">
        <button type="button" title="מודגש" onClick={() => run("bold")}><Bold size={16} /></button>
        <button type="button" title="נטוי" onClick={() => run("italic")}><Italic size={16} /></button>
        <button type="button" title="קו תחתון" onClick={() => run("underline")}><Underline size={16} /></button>
        <button type="button" title="כותרת" onClick={() => run("formatBlock", "H2")}><Heading2 size={16} /></button>
        <button type="button" title="רשימה" onClick={() => run("insertUnorderedList")}><List size={16} /></button>
        <button type="button" title="רשימה ממוספרת" onClick={() => run("insertOrderedList")}><ListOrdered size={16} /></button>
        <button type="button" title="קישור" onClick={addLink}><Link size={16} /></button>
        <button type="button" title="תמונה" onClick={() => fileRef.current?.click()}><ImagePlus size={16} /></button>
        {busy && <span className="small muted">מעלה תמונה…</span>}
      </div>
      <div
        ref={box}
        className="rich-box lesson-html"
        contentEditable
        dir="rtl"
        data-placeholder="כתבו כאן. Enter יורד שורה. אפשר להדביק תמונה עם Ctrl+V."
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          const broke = document.execCommand("insertLineBreak");
          if (!broke) document.execCommand("insertHTML", false, "<br>");
          emit();
        }}
        onInput={emit}
        onPaste={(e) => {
          const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"));
          const file = item?.getAsFile();
          if (!file) return;
          e.preventDefault();
          void insertImage(file);
        }}
        suppressContentEditableWarning
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void insertImage(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
