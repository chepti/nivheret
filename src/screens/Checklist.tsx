import { useEffect, useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { navigate } from "../app/router";
import { useStore } from "../app/store";
import { ClayIcon, ItemThumb } from "../components/ClayIcons";
import { PairDoneCheck } from "../components/PairDoneCheck";
import { ProductDrawer } from "../components/ProductDrawer";
import { myPairs } from "../lib/leadership";
import { isDroppedCapability } from "../lib/storage";
import { LEARN_HOW_LABEL, primaryStatus, STATUS_META, type StatusKey } from "../lib/status";
import type { LearnHow } from "../lib/types";
import { TeachingPicker } from "../components/TeachingPicker";
import { flyMarkToDash } from "../lib/flyMark";
import { SkillSpread } from "../viz/SkillSpread";
import { ToolOrbit } from "../viz/ToolOrbit";

export function Checklist() {
  const { data, session, upsertResponse, responseOf, addWish, removeWish } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [productCap, setProductCap] = useState<string | null>(null);
  const [wishTool, setWishTool] = useState(data.tools[0]?.id ?? "");
  const [wishToolOther, setWishToolOther] = useState("");
  const [wishCap, setWishCap] = useState("");

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

  const formCaps = useMemo(
    () => data.capabilities.filter((c) => !isDroppedCapability(c.id, c.title)),
    [data.capabilities],
  );
  const markedCount = formCaps.filter((c) => primaryStatus(responseOf(c.id)) !== "empty").length;
  const myWishes = useMemo(
    () => (data.wishes ?? []).filter((w) => w.teacherId.toLowerCase() === session?.teacherId.toLowerCase()),
    [data.wishes, session],
  );

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
      <TeachingPicker />
      <div className="mark-summary clay">
        <strong>{markedCount === formCaps.length && formCaps.length > 0 ? "הכול סומן" : `${markedCount} סומנו`}</strong>
        <span className="small muted"> · {formCaps.length - markedCount} עוד בלי סימון · {formCaps.length} יכולות בטופס</span>
      </div>

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
              const toolMarked = caps.filter((c) => primaryStatus(responseOf(c.id)) !== "empty").length;
              return (
                <article key={tool.id} className="clay tool-block">
                  <div className="tool-head">
                    {tool.image ? <ItemThumb image={tool.image} size={128} shape="free" /> : <ClayIcon name={tool.icon} bg={tool.color} />}
                    <div className="tool-head-text">
                      <h2>{tool.name}</h2>
                      <p className="small">{tool.subtitle}</p>
                      {caps.length > 0 && (
                        <p className="small" style={{ fontWeight: 700 }}>
                          {toolMarked}/{caps.length} סומנו{toolMarked === 0 ? " — עוד לא נגענו בכלי הזה" : ""}
                        </p>
                      )}
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
                            <span className={`status-tag ${st}`} aria-label={STATUS_META[st].label}>
                              <span aria-hidden>{STATUS_META[st].mark}</span>
                              {STATUS_META[st].label}
                            </span>
                          </button>
                          {open && (
                            <div style={{ marginTop: 10 }} className="dopamine">
                              <label className="check-row">
                                <input
                                  type="checkbox"
                                  checked={r.wantToLearn}
                                  onChange={(e) => {
                                    if (e.target.checked) flyMarkToDash(e.target, STATUS_META.want.color);
                                    upsertResponse({ capabilityId: cap.id, wantToLearn: e.target.checked });
                                    flash();
                                  }}
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
                                <input
                                  type="checkbox"
                                  checked={r.mastered}
                                  onChange={(e) => {
                                    if (e.target.checked) flyMarkToDash(e.target, STATUS_META.mastered.color);
                                    upsertResponse({ capabilityId: cap.id, mastered: e.target.checked });
                                    flash();
                                  }}
                                />
                                כבר שולט
                              </label>
                              <label className="check-row">
                                <input
                                  type="checkbox"
                                  checked={r.hasProduct}
                                  onChange={(e) => {
                                    if (e.target.checked) flyMarkToDash(e.target, STATUS_META.product.color);
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
                                <input
                                  type="checkbox"
                                  checked={r.readyToTeach}
                                  onChange={(e) => {
                                    if (e.target.checked) flyMarkToDash(e.target, STATUS_META.teach.color);
                                    upsertResponse({ capabilityId: cap.id, readyToTeach: e.target.checked });
                                    flash();
                                  }}
                                />
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

      <section className="clay wish-box">
        <h2>רוצה ללמוד עוד משהו?</h2>
        <div className="wish-form">
          <label className="cms-field">
            <span>כלי</span>
            <select className="field" value={wishTool} onChange={(e) => setWishTool(e.target.value)}>
              {data.tools.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
              <option value="__other__">כלי אחר — לכתוב שם</option>
            </select>
          </label>
          {wishTool === "__other__" && (
            <label className="cms-field">
              <span>שם הכלי</span>
              <input className="field" value={wishToolOther} onChange={(e) => setWishToolOther(e.target.value)} placeholder="לדוגמה: Sites, Canva…" />
            </label>
          )}
          <label className="cms-field">
            <span>יכולת</span>
            <textarea
              className="field wish-cap"
              rows={4}
              value={wishCap}
              onChange={(e) => setWishCap(e.target.value)}
              placeholder="מה רוצים ללמוד — אפשר כמה משפטים"
            />
          </label>
          <button
            className="pill btn-yellow"
            disabled={!wishCap.trim() || (wishTool === "__other__" && !wishToolOther.trim())}
            onClick={() => {
              const tool = data.tools.find((t) => t.id === wishTool);
              const toolName = wishTool === "__other__" ? wishToolOther.trim() : (tool?.name ?? "");
              const toolId = wishTool === "__other__" ? "" : wishTool;
              addWish(toolId, toolName, wishCap.trim());
              setWishCap("");
              setWishToolOther("");
              flash();
            }}
          >
            <Plus size={16} /> הוספה
          </button>
        </div>
        {myWishes.length > 0 && (
          <ul className="wish-list">
            {myWishes.map((w) => (
              <li key={w.id} className="wish-item">
                <span>
                  <strong>{w.capabilityTitle}</strong>
                  <span className="small muted"> · {w.toolName}</span>
                </span>
                <button className="small" onClick={() => { removeWish(w.id); flash(); }}>הסרה</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {productCap && (
        <ProductDrawer
          capabilityId={productCap}
          title={data.capabilities.find((c) => c.id === productCap)?.title ?? "תוצר"}
          onClose={() => setProductCap(null)}
        />
      )}

      <section className="live-dash clay" id="live-dash">
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
        <SkillSpread compact />
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
