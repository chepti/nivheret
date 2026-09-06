import { useRef, useState, type ClipboardEvent, type DragEvent } from "react";

function shrink(dataUrl: string, maxEdge: number, square: boolean, asPng: boolean, onDone: (out: string) => void) {
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
      if (!asPng) {
        ctx.fillStyle = "#fff6df";
        ctx.fillRect(0, 0, out, out);
      }
      ctx.drawImage(img, sx, sy, side, side, 0, 0, out, out);
    } else {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      if (!asPng) {
        ctx.fillStyle = "#fff6df";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    onDone(asPng ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.7));
  };
  img.src = dataUrl;
}

function keepAlpha(file: File): boolean {
  return file.type === "image/png" || file.type === "image/webp" || file.name.toLowerCase().endsWith(".png");
}

function readFile(file: File, maxEdge: number | undefined, square: boolean, onDone: (dataUrl: string) => void) {
  if (!file.type.startsWith("image/")) return;
  const asPng = keepAlpha(file);
  const reader = new FileReader();
  reader.onload = () => {
    const raw = String(reader.result);
    if (maxEdge) shrink(raw, maxEdge, square, asPng, onDone);
    else onDone(raw);
  };
  reader.readAsDataURL(file);
}

export function ImagePaste({
  value,
  onChange,
  hint = "לחצי בתיבה, ואז הדביקי עם Ctrl+V — או גררי תמונה",
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
  const [ready, setReady] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  return (
    <div
      ref={boxRef}
      className={`paste-box ${over ? "over" : ""} ${ready ? "ready" : ""}`}
      tabIndex={0}
      onClick={() => {
        boxRef.current?.focus();
        setReady(true);
      }}
      onFocus={() => setReady(true)}
      onBlur={() => setReady(false)}
      onPaste={fromClipboard}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e: DragEvent) => {
        e.preventDefault();
        setOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) take(file);
      }}
    >
      <p className="small" style={{ margin: 0 }}>{ready ? "אפשר להדביק עכשיו (Ctrl+V)" : hint}</p>
      <button
        type="button"
        className="pill btn-primary small"
        style={{ marginTop: 10 }}
        onClick={(e) => {
          e.stopPropagation();
          fileRef.current?.click();
        }}
      >
        או בחרי קובץ
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) take(file);
          e.target.value = "";
        }}
      />
      {value && (
        <div className="paste-preview">
          <img alt="" src={value} className={square ? "sq" : ""} />
          <button type="button" className="small" onClick={(e) => { e.stopPropagation(); onChange(""); }}>הסרת תמונה</button>
        </div>
      )}
    </div>
  );
}
