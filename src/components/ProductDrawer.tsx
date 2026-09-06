import { X } from "lucide-react";
import { useEffect } from "react";
import { useStore } from "../app/store";
import { ImagePaste } from "./ImagePaste";

export function ProductDrawer({
  capabilityId,
  title,
  onClose,
}: {
  capabilityId: string;
  title: string;
  onClose: () => void;
}) {
  const { data, session, upsertReaction } = useStore();
  const reaction = data.reactions.find(
    (r) => r.teacherId === session?.teacherId && r.capabilityId === capabilityId,
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="drawer-root" role="dialog" aria-modal="true" aria-label="שיתוף תוצר">
      <button className="drawer-backdrop" aria-label="סגירה" onClick={onClose} />
      <div className="drawer-sheet">
        <div className="drawer-handle" />
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="small muted">יש לי תוצר לשתף</div>
            <h2 style={{ margin: 0 }}>{title}</h2>
          </div>
          <button className="pill btn-primary small" onClick={onClose}><X size={16} /> סגירה</button>
        </div>
        <p className="small">העלי או הדביקי תמונה, ואפשר גם קישור לשיתוף. נשמר לבד.</p>
        <ImagePaste
          value={reaction?.productImage}
          maxEdge={720}
          hint="לחצי בתיבה ואז Ctrl+V, או גררי תמונה"
          onChange={(productImage) => upsertReaction({ capabilityId, productImage: productImage || undefined })}
        />
        <label className="cms-field" style={{ marginTop: 12 }}>
          <span>קישור לשיתוף (Drive, אתר, מצגת…)</span>
          <input
            className="field"
            dir="ltr"
            placeholder="https://"
            value={reaction?.productUrl ?? ""}
            onChange={(e) => upsertReaction({ capabilityId, productUrl: e.target.value })}
          />
        </label>
        <label className="cms-field">
          <span>הערה קצרה (לא חובה)</span>
          <textarea
            className="field"
            rows={2}
            value={reaction?.productNote ?? ""}
            onChange={(e) => upsertReaction({ capabilityId, productNote: e.target.value })}
          />
        </label>
        <button className="pill btn-ink" style={{ width: "100%", justifyContent: "center" }} onClick={onClose}>
          שמור וסגרי
        </button>
      </div>
    </div>
  );
}
