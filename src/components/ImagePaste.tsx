import { useState, type ClipboardEvent, type DragEvent } from "react";

function shrink(dataUrl: string, maxEdge: number, onDone: (out: string) => void) {
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
    onDone(canvas.toDataURL("image/jpeg", 0.82));
  };
  img.src = dataUrl;
}

function readFile(file: File, maxEdge: number | undefined, onDone: (dataUrl: string) => void) {
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    const raw = String(reader.result);
    if (maxEdge) shrink(raw, maxEdge, onDone);
    else onDone(raw);
  };
  reader.readAsDataURL(file);
}

export function ImagePaste({
  value,
  onChange,
  hint = "הדביקי צילום מסך כאן (Ctrl+V או ⌘V), גררי תמונה, או בחרי קובץ",
  maxEdge,
}: {
  value?: string;
  onChange: (dataUrl: string) => void;
  hint?: string;
  maxEdge?: number;
}) {
  const [over, setOver] = useState(false);

  const take = (file: File) => readFile(file, maxEdge, onChange);

  const fromClipboard = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          take(file);
        }
      }
    }
  };

  const fromDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) take(file);
  };

  return (
    <div
      className={`paste-box ${over ? "over" : ""}`}
      tabIndex={0}
      onPaste={fromClipboard}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={fromDrop}
    >
      <p className="small" style={{ margin: 0 }}>{hint}</p>
      <input
        type="file"
        accept="image/*"
        className="field"
        style={{ marginTop: 8 }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) take(file);
        }}
      />
      {value && <img alt="" src={value} />}
    </div>
  );
}
