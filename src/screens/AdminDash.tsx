import { useMemo } from "react";
import { useStore } from "../app/store";
import { GoogleGate } from "../components/GoogleGate";
import { HeatMap } from "../viz/HeatMap";
import { TeamRings } from "../viz/TeamRings";
import { ToolOrbit } from "../viz/ToolOrbit";
import { primaryStatus, STATUS_META, type StatusKey } from "../lib/status";

export function AdminDash() {
  const { data, isAdmin } = useStore();
  const active = useMemo(() => {
    const ids = new Set(
      data.responses.filter((r) => r.wantToLearn || r.mastered || r.hasProduct || r.readyToTeach).map((r) => r.teacherId),
    );
    return ids.size;
  }, [data.responses]);

  const dist = useMemo(() => {
    const d: Record<StatusKey, number> = { empty: 0, want: 0, mastered: 0, product: 0, teach: 0 };
    for (const r of data.responses) d[primaryStatus(r)] += 1;
    const total = Object.values(d).reduce((a, b) => a + b, 0) || 1;
    return { d, total };
  }, [data.responses]);

  const praise = useMemo(() => {
    return data.teachers
      .filter((t) => data.responses.some((r) => r.teacherId === t.id && (r.readyToTeach || r.hasProduct)))
      .slice(0, 5);
  }, [data]);

  const needBoost = useMemo(() => {
    return [...data.capabilities]
      .map((c) => ({ c, n: data.responses.filter((r) => r.capabilityId === c.id && r.wantToLearn).length }))
      .sort((a, b) => b.n - a.n)[0];
  }, [data]);

  if (!isAdmin) {
    return (
      <GoogleGate>
        <div className="clay" style={{ padding: 20 }}><h2>לאדמין בלבד</h2></div>
      </GoogleGate>
    );
  }

  return (
    <GoogleGate>
      <h1>דשבורד הנהלה</h1>
      <p>{active} מורות פעילות מתוך {data.teachers.length} בספר.</p>

      <div className="grid-2" style={{ margin: "14px 0" }}>
        <div className="clay-yellow clay" style={{ padding: 16 }}>
          <div className="small">פרגני השבוע</div>
          <h2>{data.settings.praiseNote}</h2>
          {praise.map((t) => <div key={t.id}>{t.firstName} {t.lastName}</div>)}
          {!praise.length && <p>עוד אין מועמדות לפרגון — חכי לסימונים הראשונים.</p>}
        </div>
        <div className="clay" style={{ padding: 16 }}>
          <div className="small">צריך חיזוק</div>
          <h2>{needBoost ? needBoost.c.title : "—"}</h2>
          <p>{needBoost ? `${needBoost.n} מורות רוצות ללמוד את זה` : ""}</p>
        </div>
      </div>

      <section className="clay" style={{ padding: 16, marginBottom: 14 }}>
        <h2>מגמת התקדמות</h2>
        <p className="small">סימונים שנשמרו במכשיר זה (ומאוחר יותר מ־Firebase).</p>
        <div style={{ height: 90, display: "flex", alignItems: "flex-end", gap: 4 }}>
          {["שולטות", "רוצות", "תוצר", "מלמדות"].map((label, i) => {
            const keys: StatusKey[] = ["mastered", "want", "product", "teach"];
            const h = 12 + (dist.d[keys[i]] / dist.total) * 70;
            return (
              <div key={label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: h, borderRadius: 12, background: STATUS_META[keys[i]].color }} />
                <div className="small">{label}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="clay" style={{ padding: 16, marginBottom: 14 }}>
        <h2>מפת חום</h2>
        <HeatMap />
      </section>

      <section style={{ marginBottom: 14 }}>
        <h2>מצב הצוות</h2>
        <TeamRings />
      </section>

      <section>
        <h2>שליטה ביכולות — כלי במרכז</h2>
        <div className="grid-tools">
          {data.tools.map((tool) => (
            <ToolOrbit key={tool.id} tool={tool} showNames />
          ))}
        </div>
      </section>

      <section className="clay" style={{ padding: 16, marginTop: 16 }}>
        <h2>התפלגות סטטוסים</h2>
        {(Object.keys(STATUS_META) as StatusKey[]).filter((k) => k !== "empty").map((k) => {
          const pct = Math.round((dist.d[k] / dist.total) * 100);
          return (
            <div key={k} style={{ marginBottom: 8 }}>
              <div className="small">{STATUS_META[k].label} · {pct}%</div>
              <div style={{ height: 10, borderRadius: 999, background: "#f1ead8" }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: STATUS_META[k].color }} />
              </div>
            </div>
          );
        })}
      </section>
    </GoogleGate>
  );
}
