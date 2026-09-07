import { useEffect, useRef, useState, type ClipboardEvent, type DragEvent } from "react";

function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.name);
}

function keepAlpha(file: File): boolean {
  return file.type === "image/png" || file.type === "image/webp" || file.name.toLowerCase().endsWith(".png");
}

function shrink(
  dataUrl: string,
  maxEdge: number,
  square: boolean,
  asPng: boolean,
  quality: number,
  onDone: (out: string) => void,
  onFail: () => void,
) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      onFail();
      return;
    }
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
    onDone(asPng ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", quality));
  };
  img.onerror = () => onFail();
  img.src = dataUrl;
}

function readFile(
  file: File,
  maxEdge: number | undefined,
  square: boolean,
  forceJpeg: boolean,
  onDone: (dataUrl: string) => void,
  onFail: () => void,
) {
  if (!isImageFile(file)) {
    onFail();
    return;
  }
  const asPng = !forceJpeg && keepAlpha(file);
  const reader = new FileReader();
  reader.onload = () => {
    const raw = String(reader.result);
    if (maxEdge) shrink(raw, maxEdge, square, asPng, 0.55, onDone, onFail);
    else onDone(raw);
  };
  reader.onerror = () => onFail();
  reader.readAsDataURL(file);
}

export function ImagePaste({
  value,
  onChange,
  hint = "לחצו בתיבה, ואז הדביקו עם Ctrl+V — או גררו תמונה",
  maxEdge,
  square = false,
  forceJpeg = false,
  upload,
}: {
  value?: string;
  onChange: (dataUrl: string) => void;
  hint?: string;
  maxEdge?: number;
  square?: boolean;
  forceJpeg?: boolean;
  upload?: (dataUrl: string) => Promise<string>;
}) {
  const [over, setOver] = useState(false);
  const [preview, setPreview] = useState(value ?? "");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const gen = useRef(0);

  useEffect(() => {
    if (!busy) setPreview(value ?? "");
  }, [value, busy]);

  const take = (file: File) => {
    const token = ++gen.current;
    setBusy(true);
    setNote("מכינים תמונה…");
    readFile(
      file,
      maxEdge,
      square,
      forceJpeg,
      (dataUrl) => {
        if (token !== gen.current) return;
        setPreview(dataUrl);
        if (!upload) {
          onChange(dataUrl);
          setBusy(false);
          setNote("נשמרה");
          return;
        }
        setNote("מעלה…");
        void upload(dataUrl)
          .then((url) => {
            if (token !== gen.current) return;
            setPreview(url);
            onChange(url);
            setBusy(false);
            setNote("נשמרה");
          })
          .catch(() => {
            if (token !== gen.current) return;
            setBusy(false);
            setNote("ההעלאה נכשלה. נסו שוב.");
          });
      },
      () => {
        if (token !== gen.current) return;
        setBusy(false);
        setNote("לא הצלחנו לקרוא את התמונה. נסו PNG או JPG.");
      },
    );
  };

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

  const shown = preview || value || "";

  return (
    <div
      ref={boxRef}
      className={`paste-box ${over ? "over" : ""} ${busy ? "busy" : ""}`}
      tabIndex={0}
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
      <p className="small" style={{ margin: 0, color: note.startsWith("ה") || note.startsWith("לא") ? "#c0392b" : undefined }}>
        {busy ? note : note || hint}
      </p>
      <button
        type="button"
        className="pill btn-primary small"
        style={{ marginTop: 10 }}
        disabled={busy}
        onClick={() => fileRef.current?.click()}
      >
        {busy ? "מעלה…" : "בחירת קובץ"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) take(file);
          e.target.value = "";
        }}
      />
      {shown && (
        <div className="paste-preview">
          <img alt="" src={shown} className={square ? "sq" : ""} />
          <button
            type="button"
            className="small"
            disabled={busy}
            onClick={() => {
              gen.current += 1;
              setPreview("");
              setNote("");
              setBusy(false);
              onChange("");
            }}
          >
            הסרת תמונה
          </button>
        </div>
      )}
    </div>
  );
}
