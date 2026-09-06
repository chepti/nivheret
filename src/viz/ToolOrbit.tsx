import { useMemo, useState } from "react";
import { useStore } from "../app/store";
import { ClayIcon } from "../components/ClayIcons";
import { primaryStatus, STATUS_META, type StatusKey } from "../lib/status";
import type { Tool } from "../lib/types";

const KEYS: StatusKey[] = ["want", "mastered", "product", "teach"];
const POS = [
  { top: 8, right: 82 },
  { top: 82, right: 8 },
  { bottom: 8, right: 82 },
  { top: 82, left: 8 },
];

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
    for (const t of data.teachers) {
      const rows = data.responses.filter((r) => r.teacherId === t.id && caps.some((c) => c.id === r.capabilityId));
      if (!rows.length) continue;
      const best = KEYS.reduce<StatusKey>((acc, k) => {
        const has = rows.some((r) => primaryStatus(r) === k);
        return has ? k : acc;
      }, "empty");
      if (best === "empty") continue;
      map[best].n += 1;
      map[best].names.push(`${t.firstName} ${t.lastName}`);
    }
    return map;
  }, [caps, data]);

  return (
    <div className="clay" style={{ padding: 12, textAlign: "center" }}>
      <div className="tool-orbit">
        <div className="orbit-center">
          <ClayIcon name={tool.icon} bg={tool.color} size={26} />
          <strong style={{ marginTop: 6 }}>{tool.name}</strong>
        </div>
        {KEYS.map((k, i) => (
          <button
            key={k}
            className="orbit-bubble"
            style={{ ...POS[i], background: STATUS_META[k].color }}
            title={STATUS_META[k].label}
            onClick={() => showNames && setOpen(open === k ? null : k)}
          >
            {counts[k].n}
          </button>
        ))}
      </div>
      <div className="small muted">{KEYS.map((k) => `${STATUS_META[k].label}`).join(" · ")}</div>
      {showNames && open && (
        <div className="small" style={{ textAlign: "right", marginTop: 8 }}>
          <strong>{STATUS_META[open].label}:</strong>
          <div>{counts[open].names.join(", ") || "אין עדיין"}</div>
        </div>
      )}
    </div>
  );
}
