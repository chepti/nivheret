import { useMemo, useState } from "react";
import { useStore } from "../app/store";
import { ClayIcon } from "../components/ClayIcons";
import { primaryStatus, STATUS_META, type StatusKey } from "../lib/status";
import type { Tool } from "../lib/types";

const KEYS: StatusKey[] = ["want", "mastered", "product", "teach"];

export function ToolOrbit({ tool, showNames }: { tool: Tool; showNames: boolean }) {
  const { data } = useStore();
  const [open, setOpen] = useState<StatusKey | null>(null);
  const caps = data.capabilities.filter((c) => c.toolId === tool.id);

  const counts = useMemo(() => {
    const map: Record<StatusKey, { n: number; names: string[] }> = {
      empty: { n: 0, names: [] },
      want: { n: 0, names: [] },
      mastered: { n: 0, names: [] },
      product: { n: 0, names: [] },
      teach: { n: 0, names: [] },
    };
    for (const r of data.responses) {
      if (!caps.some((c) => c.id === r.capabilityId)) continue;
      const st = primaryStatus(r);
      if (st === "empty") continue;
      map[st].n += 1;
      const teacher = data.teachers.find((t) => t.id.toLowerCase() === r.teacherId.toLowerCase());
      const name = teacher ? `${teacher.firstName} ${teacher.lastName}` : r.teacherId;
      if (!map[st].names.includes(name)) map[st].names.push(name);
    }
    return map;
  }, [caps, data.responses, data.teachers]);

  const total = KEYS.reduce((s, k) => s + counts[k].n, 0);
  const r = 70;
  const c = 2 * Math.PI * r;
  let acc = 0;

  return (
    <div className="clay" style={{ padding: 16, textAlign: "center" }}>
      <div className="arc-wrap">
        <svg viewBox="0 0 200 200" className="arc-svg">
          <circle cx="100" cy="100" r={r} fill="none" stroke="#efe6d2" strokeWidth="18" />
          {KEYS.map((k) => {
            const n = counts[k].n;
            const frac = total ? n / total : 0;
            const start = acc;
            acc += frac;
            return (
              <circle
                key={k}
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke={STATUS_META[k].color}
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray={`${Math.max(0, frac * c - 6)} ${c}`}
                strokeDashoffset={-start * c}
                transform="rotate(-90 100 100)"
                className="arc-seg"
              />
            );
          })}
        </svg>
        <div className="orbit-center">
          <ClayIcon name={tool.icon} bg={tool.color} size={26} />
          <strong>{tool.name}</strong>
        </div>
      </div>
      <div className="arc-legend">
        {KEYS.map((k) => (
          <button key={k} className="arc-leg" onClick={() => showNames && setOpen(open === k ? null : k)}>
            <span className="status-dot" style={{ background: STATUS_META[k].color }} />
            {counts[k].n} {STATUS_META[k].label}
          </button>
        ))}
      </div>
      {showNames && open && (
        <div className="small" style={{ textAlign: "right", marginTop: 8 }}>
          <strong>{STATUS_META[open].label}:</strong>
          <div>{counts[open].names.join(", ") || "אין עדיין"}</div>
        </div>
      )}
    </div>
  );
}
