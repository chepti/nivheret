import { useMemo } from "react";
import { useStore } from "../app/store";
import { skillSpread, type SpreadGroup } from "../lib/spread";

function Bars({ group }: { group: SpreadGroup }) {
  return (
    <div className="spread-tools">
      {group.tools.slice(0, 4).map((t) => {
        const pct = Math.round((t.mastered / t.n) * 100);
        const used = Math.round((t.used / t.n) * 100);
        return (
          <div key={t.toolId} className="spread-row">
            <span className="small">{t.name}</span>
            <div className="spread-bar" title={`${t.mastered}/${t.n} שליטה · ${t.used}/${t.n} סימנו`}>
              <span className="used" style={{ width: `${used}%` }} />
              <span className="mastered" style={{ width: `${pct}%` }} />
            </div>
            <span className="small muted">{pct}% שליטה</span>
          </div>
        );
      })}
    </div>
  );
}

export function SkillSpread({ compact }: { compact?: boolean }) {
  const { data } = useStore();
  const spread = useMemo(() => skillSpread(data), [data]);
  const hasCatalog = (data.classrooms ?? []).length + (data.subjects ?? []).length > 0;
  if (!hasCatalog) return null;

  const empty = !spread.layers.length && !spread.subjects.length;
  if (compact) {
    const lines = [...spread.layers, ...spread.subjects].sort((a, b) => b.n - a.n).slice(0, 3);
    if (!lines.length) return null;
    return (
      <div className="spread-lines">
        {lines.map((g) => (
          <p key={g.id} className="spread-line">{g.headline}</p>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 18 }}>פיזור לפי שכבות וכיתות</h2>
      {empty && <p className="small">עוד אין מספיק סימוני כיתות בטופס.</p>}
      {spread.layers.map((g) => (
        <article key={g.id} className="clay spread-card">
          <strong>{g.headline}</strong>
          <p className="small muted" style={{ margin: "4px 0 8px" }}>{g.n} מורות עם סימון בטופס</p>
          <Bars group={g} />
        </article>
      ))}
      <h2 style={{ marginTop: 18 }}>פיזור לפי צוותי תחום</h2>
      {!spread.subjects.length && <p className="small">עוד אין מספיק סימוני תחום דעת.</p>}
      {spread.subjects.map((g) => (
        <article key={g.id} className="clay spread-card">
          <strong>{g.headline}</strong>
          <p className="small muted" style={{ margin: "4px 0 8px" }}>{g.n} בצוות עם סימון בטופס</p>
          <Bars group={g} />
        </article>
      ))}
    </div>
  );
}
