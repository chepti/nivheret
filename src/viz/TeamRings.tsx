import { useState } from "react";
import { useStore } from "../app/store";
import { initials, primaryStatus, STATUS_META, type StatusKey } from "../lib/status";

const KEYS: StatusKey[] = ["want", "mastered", "product", "teach"];

function Ring({ parts }: { parts: Record<StatusKey, number> }) {
  const total = KEYS.reduce((s, k) => s + parts[k], 0) || 1;
  let acc = 0;
  const segs = KEYS.map((k) => {
    const start = acc / total;
    acc += parts[k];
    return { k, start, end: acc / total };
  });
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="#eee6d4" strokeWidth="12" />
      {segs.map((s) => (
        <circle
          key={s.k}
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={STATUS_META[s.k].color}
          strokeWidth="12"
          strokeDasharray={`${(s.end - s.start) * c} ${c}`}
          strokeDashoffset={-s.start * c}
          transform="rotate(-90 55 55)"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

export function TeamRings() {
  const { data } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const active = data.teachers.filter((t) =>
    data.responses.some((r) => r.teacherId === t.id && (r.wantToLearn || r.mastered || r.hasProduct || r.readyToTeach)),
  );

  if (!active.length) {
    return <p>עוד אין מורות שמילאו את הטופס — המעגלים יופיעו כאן.</p>;
  }

  return (
    <div className="ring-grid">
      {active.map((t) => {
        const rows = data.responses.filter((r) => r.teacherId === t.id);
        const parts = { empty: 0, want: 0, mastered: 0, product: 0, teach: 0 } as Record<StatusKey, number>;
        for (const r of rows) parts[primaryStatus(r)] += 1;
        const mastered = parts.mastered + parts.product + parts.teach;
        return (
          <button key={t.id} className="clay" style={{ padding: 12, textAlign: "center" }} onClick={() => setOpen(open === t.id ? null : t.id)}>
            <div style={{ position: "relative", width: 110, height: 110, margin: "0 auto" }}>
              <Ring parts={parts} />
              <div style={{ position: "absolute", inset: 28, borderRadius: "50%", background: "#fff6df", display: "grid", placeItems: "center", fontWeight: 800 }}>
                {initials(t.firstName, t.lastName)}
              </div>
            </div>
            <strong>{t.firstName} {t.lastName}</strong>
            <div className="small muted">{mastered} שולט · {parts.want} רוצה ללמוד</div>
            {open === t.id && (
              <div className="small" style={{ marginTop: 8, textAlign: "right" }}>
                {KEYS.map((k) => (
                  <div key={k}>{STATUS_META[k].label}: {parts[k]}</div>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
