import { useState, type ClipboardEvent, type DragEvent } from "react";

function shrink(dataUrl: string, maxEdge: number, square: boolean, onDone: (out: string) => void) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (square) {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const out = Math.min(maxEdge, side);
      canvas.width = out;
      canvas.height = out;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, out, out);
    } else {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    onDone(canvas.toDataURL("image/jpeg", 0.68));
  };
  img.src = dataUrl;
}

function readFile(file: File, maxEdge: number | undefined, square: boolean, onDone: (dataUrl: string) => void) {
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    const raw = String(reader.result);
    if (maxEdge) shrink(raw, maxEdge, square, onDone);
    else onDone(raw);
  };
  reader.readAsDataURL(file);
}

export function ImagePaste({
  value,
  onChange,
  hint = "הדביקי כאן (Ctrl+V), גררי תמונה, או בחרי קובץ",
  maxEdge,
  square = false,
}: {
  value?: string;
  onChange: (dataUrl: string) => void;
  hint?: string;
  maxEdge?: number;
  square?: boolean;
}) {
  const [over, setOver] = useState(false);

  const take = (file: File) => readFile(file, maxEdge, square, onChange);

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
      {value && (
        <div className="paste-preview">
          <img alt="" src={value} className={square ? "sq" : ""} />
          <button type="button" className="small" onClick={() => onChange("")}>הסרת תמונה</button>
        </div>
      )}
    </div>
  );
}
