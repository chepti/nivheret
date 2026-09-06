import { useState, type ClipboardEvent, type DragEvent } from "react";

function readFile(file: File, onDone: (dataUrl: string) => void) {
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => onDone(String(reader.result));
  reader.readAsDataURL(file);
}

export function ImagePaste({
  value,
  onChange,
}: {
  value?: string;
  onChange: (dataUrl: string) => void;
}) {
  const [over, setOver] = useState(false);

  const fromClipboard = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          readFile(file, onChange);
        }
      }
    }
  };

  const fromDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file, onChange);
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
      <p className="small" style={{ margin: 0 }}>
        הדביקי צילום מסך כאן (Ctrl+V או ⌘V), גררי תמונה, או בחרי קובץ
      </p>
      <input
        type="file"
        accept="image/*"
        className="field"
        style={{ marginTop: 8 }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readFile(file, onChange);
        }}
      />
      {value && <img alt="תוצר שהודבק" src={value} />}
    </div>
  );
}
