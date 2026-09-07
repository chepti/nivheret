import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { navigate } from "../app/router";
import { useStore } from "../app/store";
import { ClayIcon, ItemThumb } from "../components/ClayIcons";
import { PairDoneCheck } from "../components/PairDoneCheck";
import { ProductDrawer } from "../components/ProductDrawer";
import { myPairs } from "../lib/leadership";
import { isDroppedCapability } from "../lib/storage";
import { LEARN_HOW_LABEL, primaryStatus, STATUS_META, type StatusKey } from "../lib/status";
import type { LearnHow } from "../lib/types";
import { ToolOrbit } from "../viz/ToolOrbit";

export function Checklist() {
  const { data, session, upsertResponse, responseOf } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [productCap, setProductCap] = useState<string | null>(null);

  useEffect(() => {
    if (!session) navigate("welcome");
  }, [session]);

  const flash = () => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 900);
  };

  const myPairList = useMemo(
    () => (session ? myPairs(data, session.teacherId) : []),
    [data, session],
  );

  const answeredTeachers = useMemo(() => {
    const ids = new Set(data.responses.filter((r) => r.wantToLearn || r.mastered || r.hasProduct || r.readyToTeach).map((r) => r.teacherId));
    return ids.size;
  }, [data.responses]);

  const liveLines = useMemo(() => {
    return data.capabilities
      .map((c) => {
        const n = data.responses.filter((r) => r.capabilityId === c.id && r.readyToTeach).length;
        return n > 0 ? `${n} מוכנים ללמד ${c.title}` : null;
      })
      .filter(Boolean)
      .slice(0, 3) as string[];
  }, [data]);

  if (!session) return null;

  return (
    <div>
      {savedFlash && <div className="toast-save">נשמר</div>}
      <h1>הצ׳קליסט שלי</h1>
      <p>לחצו על יכולת, סמנו, ועברו הלאה — נשמר לבד.</p>

      {data.periods.map((period) => {
        const periodTools = data.tools.filter((t) => t.periodId === period.id).sort((a, b) => a.order - b.order);
        if (!periodTools.length) return null;
        const current = period.id === "elul-tishrei";
        return (
          <section key={period.id} style={{ marginTop: 22 }}>
            <div className={current ? "clay-yellow clay" : "clay"} style={{ padding: "12px 16px", marginBottom: 12, borderRadius: 22 }}>
              <strong>{period.name}</strong>
              <span className="small muted"> · {period.months}</span>
            </div>
            {periodTools.map((tool) => {
              const caps = data.capabilities
                .filter((c) => c.toolId === tool.id && !isDroppedCapability(c.id, c.title))
                .sort((a, b) => a.order - b.order);
              return (
                <article key={tool.id} className="clay tool-block">
                  <div className="tool-head">
                    {tool.image ? <ItemThumb image={tool.image} size={128} shape="free" /> : <ClayIcon name={tool.icon} bg={tool.color} />}
                    <div className="tool-head-text">
                      <h2>{tool.name}</h2>
                      <p className="small">{tool.subtitle}</p>
                    </div>
                  </div>
                  {caps.length === 0 ? (
                    <p className="small">עוד אין יכולות לתקופה הזו.</p>
                  ) : (
                    caps.map((cap) => {
                      const r = responseOf(cap.id);
                      const st = primaryStatus(r);
                      const open = openId === cap.id;
                      return (
                        <div key={cap.id} className={`cap-card clay ${st} ${open ? "open" : ""}`} style={{ marginBottom: 8, boxShadow: "var(--shadow-sm)" }}>
                          <button
                            className="cap-line"
                            onClick={() => setOpenId(open ? null : cap.id)}
                          >
                            {cap.image && <ItemThumb image={cap.image} size={52} shape="soft" />}
                            <span className="cap-line-text">
                              <strong>{cap.title}</strong>
                              <span className="small muted">{cap.description}</span>
                            </span>
                          </button>
                          {open && (
                            <div style={{ marginTop: 10 }} className="dopamine">
                              <label className="check-row">
                                <input
                                  type="checkbox"
                                  checked={r.wantToLearn}
                                  onChange={(e) => { upsertResponse({ capabilityId: cap.id, wantToLearn: e.target.checked }); flash(); }}
                                />
                                רוצה ללמוד
                              </label>
                              {r.wantToLearn && (
                                <div className="row" style={{ paddingInlineStart: 28, marginBottom: 8 }}>
                                  {(Object.keys(LEARN_HOW_LABEL) as LearnHow[]).map((k) => (
                                    <button
                                      key={k}
                                      className={`pill small ${r.learnHow === k ? "btn-yellow" : "btn-primary"}`}
                                      onClick={() => { upsertResponse({ capabilityId: cap.id, wantToLearn: true, learnHow: k }); flash(); }}
                                    >
                                      {LEARN_HOW_LABEL[k]}
                                    </button>
                                  ))}
                                </div>
                              )}
                              <label className="check-row">
                                <input type="checkbox" checked={r.mastered} onChange={(e) => { upsertResponse({ capabilityId: cap.id, mastered: e.target.checked }); flash(); }} />
                                כבר שולט
                              </label>
                              <label className="check-row">
                                <input
                                  type="checkbox"
                                  checked={r.hasProduct}
                                  onChange={(e) => {
                                    upsertResponse({ capabilityId: cap.id, hasProduct: e.target.checked });
                                    flash();
                                    if (e.target.checked) setProductCap(cap.id);
                                  }}
                                />
                                יש לי תוצר לשתף
                              </label>
                              {r.hasProduct && (
                                <button className="pill btn-yellow small" style={{ marginInlineStart: 28 }} onClick={() => setProductCap(cap.id)}>
                                  עריכת תוצר
                                </button>
                              )}
                              <label className="check-row">
                                <input type="checkbox" checked={r.readyToTeach} onChange={(e) => { upsertResponse({ capabilityId: cap.id, readyToTeach: e.target.checked }); flash(); }} />
                                מוכן ללמד עמית 1:1
                              </label>
                              {myPairList.filter((p) => p.capabilityId === cap.id).map((p) => {
                                const me = session!.teacherId.toLowerCase();
                                const other = p.learnerId.toLowerCase() === me ? p.mentorName : p.learnerName;
                                return (
                                  <PairDoneCheck
                                    key={p.id}
                                    pair={p}
                                    label={p.done ? `קיימנו 1:1 עם ${other} ✓` : `קיימנו 1:1 עם ${other}`}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </article>
              );
            })}
          </section>
        );
      })}

      {productCap && (
        <ProductDrawer
          capabilityId={productCap}
          title={data.capabilities.find((c) => c.id === productCap)?.title ?? "תוצר"}
          onClose={() => setProductCap(null)}
        />
      )}

      <section className="live-dash clay">
        <h2>דשבורד חי</h2>
        <p>{answeredTeachers} מורות כבר ענו בטופס.</p>
        <div className="row" style={{ marginBottom: 12 }}>
          {(Object.keys(STATUS_META) as StatusKey[]).filter((k) => k !== "empty").map((k) => {
            const n = data.responses.filter((r) => primaryStatus(r) === k).length;
            return (
              <span key={k} className="badge-chip">
                <span className="status-dot" style={{ background: STATUS_META[k].color }} />
                {n} {STATUS_META[k].label}
              </span>
            );
          })}
        </div>
        {liveLines.map((line) => <p key={line} style={{ color: "var(--ink)" }}>{line}</p>)}
        <div className="grid-tools" style={{ marginTop: 8 }}>
          {data.tools.filter((t) => data.capabilities.some((c) => c.toolId === t.id)).map((tool) => (
            <ToolOrbit key={tool.id} tool={tool} showNames={false} />
          ))}
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <Sparkles size={16} /> <span className="small">המספרים מתעדכנים עם כל סימון.</span>
        </div>
      </section>
    </div>
  );
}
