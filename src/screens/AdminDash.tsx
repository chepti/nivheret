import { useMemo, useState } from "react";
import { useStore } from "../app/store";
import { GoogleGate } from "../components/GoogleGate";
import { PairDoneCheck } from "../components/PairDoneCheck";
import { HeatMap } from "../viz/HeatMap";
import { TeamRings } from "../viz/TeamRings";
import { ToolOrbit } from "../viz/ToolOrbit";
import {
  capabilityInsights,
  copyText,
  findTeacher,
  openMail,
  suggestedPairs,
  teacherEmail,
} from "../lib/leadership";
import { formatHebDate, LEARN_HOW_LABEL } from "../lib/status";
import type { LearnHow } from "../lib/types";

type Tab = "map" | "teach" | "pairs" | "meetings";

export function AdminDash() {
  const { data, isAdmin } = useStore();
  const [tab, setTab] = useState<Tab>("map");
  const [flash, setFlash] = useState("");
  const [openCap, setOpenCap] = useState<string | null>(null);
  const [openMeet, setOpenMeet] = useState<string | null>(null);

  const insights = useMemo(() => capabilityInsights(data), [data]);
  const pairing = useMemo(() => suggestedPairs(data), [data]);
  const openPairs = pairing.pairs.filter((p) => !p.done);
  const donePairs = pairing.pairs.filter((p) => p.done);
  const active = useMemo(() => {
    const ids = new Set(
      data.responses.filter((r) => r.wantToLearn || r.mastered || r.hasProduct || r.readyToTeach).map((r) => r.teacherId.toLowerCase()),
    );
    return ids.size;
  }, [data.responses]);

  const ping = async (text: string) => {
    const ok = await copyText(text);
    setFlash(ok ? "הועתק" : "לא הצלחנו להעתיק");
    window.setTimeout(() => setFlash(""), 1400);
  };

  if (!isAdmin) {
    return (
      <GoogleGate>
        <div className="clay" style={{ padding: 20 }}><h2>לאדמין בלבד</h2></div>
      </GoogleGate>
    );
  }

  return (
    <GoogleGate>
      {flash && <div className="toast-save">{flash}</div>}
      <h1>מידע להנהלה</h1>
      <p>{active} מורות ענו בטופס מתוך {data.teachers.length}.</p>

      <div className="cms-tabs" style={{ margin: "12px 0 16px" }}>
        <button className={tab === "map" ? "on" : ""} onClick={() => setTab("map")}>דשבורד</button>
        <button className={tab === "teach" ? "on" : ""} onClick={() => setTab("teach")}>מה ללמד</button>
        <button className={tab === "pairs" ? "on" : ""} onClick={() => setTab("pairs")}>שידוך צמדים</button>
        <button className={tab === "meetings" ? "on" : ""} onClick={() => setTab("meetings")}>מפגשים</button>
      </div>

      {tab === "map" && (
        <section>
          {data.settings.praiseNote && (
            <div className="clay" style={{ padding: 16, marginBottom: 14 }}>
              <p style={{ margin: 0 }}>{data.settings.praiseNote}</p>
            </div>
          )}
          <div className="clay" style={{ padding: 16, marginBottom: 14 }}>
            <h2>מפת חום</h2>
            <HeatMap />
          </div>
          <h2>לפי מורה</h2>
          <TeamRings />
          <h2 style={{ marginTop: 18 }}>לפי כלי</h2>
          <div className="grid-tools">
            {data.tools.filter((t) => data.capabilities.some((c) => c.toolId === t.id)).map((tool) => (
              <ToolOrbit key={tool.id} tool={tool} showNames />
            ))}
          </div>
        </section>
      )}

      {tab === "teach" && (
        <section className="compact-stack">
          {!insights.length && <p>עוד אין סימונים מדויקים. ברגע שמורות ימלאו — יופיעו כאן שמות ואיך הן רוצות ללמוד.</p>}
          {insights.map((row) => {
            const open = openCap === row.cap.id;
            return (
              <article key={row.cap.id} className="clay compact-card">
                <button className="compact-head" onClick={() => setOpenCap(open ? null : row.cap.id)}>
                  <span>
                    <strong>{row.cap.title}</strong>
                    <span className="small muted"> {row.toolName}</span>
                  </span>
                  <span className="small muted">
                    {row.want.length} לומדות · {row.teach.length} מלמדות · {row.product.length} תוצרים
                  </span>
                </button>
                <p className="small compact-hint">{row.suggest}</p>
                {open && (
                  <div className="compact-body">
                    {(Object.keys(LEARN_HOW_LABEL) as LearnHow[]).some((k) => row.howCounts[k]) && (
                      <p className="small">
                        {(Object.keys(LEARN_HOW_LABEL) as LearnHow[])
                          .filter((k) => row.howCounts[k])
                          .map((k) => `${LEARN_HOW_LABEL[k]} — ${row.howCounts[k]}`)
                          .join(" · ")}
                      </p>
                    )}
                    {!!row.want.length && (
                      <p className="small"><strong>לומדות: </strong>{row.want.map((w) => `${w.name}${w.how ? ` (${LEARN_HOW_LABEL[w.how]})` : ""}`).join(" · ")}</p>
                    )}
                    {!!row.teach.length && (
                      <p className="small"><strong>מלמדות: </strong>{row.teach.map((t) => t.name).join(" · ")}</p>
                    )}
                    {!!row.product.length && (
                      <p className="small">
                        <strong>תוצרים: </strong>
                        {row.product.map((p, i) => (
                          <span key={p.id}>
                            {i > 0 && " · "}
                            {p.url ? <a href={p.url} target="_blank" rel="noreferrer">{p.name}</a> : p.name}
                          </span>
                        ))}
                      </p>
                    )}
                    <div className="row" style={{ marginTop: 6 }}>
                      <button
                        className="pill btn-primary small"
                        onClick={() => openMail(
                          row.want.map((w) => teacherEmail(data, w.id)),
                          `למידה: ${row.cap.title}`,
                          `שלום,\n\nנראה שיש עניין ביכולת «${row.cap.title}».\n${row.suggest}\n\nנבחרת`,
                        )}
                      >
                        מייל
                      </button>
                      <button
                        className="pill btn-yellow small"
                        onClick={() => void ping(row.want.map((w) => teacherEmail(data, w.id)).join(", "))}
                      >
                        העתקה
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {tab === "pairs" && (
        <section>
          <p className="small">צמד = לומדת + מלמדת. גם המורות יכולות לסמן בצ׳קליסט ובפרופיל שזה קרה.</p>
          {!pairing.pairs.length && <p>אין עדיין גם «רוצה ללמוד» וגם «מלמדת» על אותה יכולת.</p>}
          {!!openPairs.length && (
            <div className="clay compact-card">
              {openPairs.map((p) => (
                <div key={p.id} className="pair-row">
                  <span>
                    <strong>{p.learnerName}</strong>
                    <span className="muted"> ← </span>
                    {p.mentorName}
                  </span>
                  <span className="small muted">{p.capabilityTitle}</span>
                  <PairDoneCheck pair={p} />
                  <button
                    className="pill btn-ink small"
                    onClick={() => openMail(
                      [teacherEmail(data, p.learnerId), teacherEmail(data, p.mentorId)],
                      `צמד למידה: ${p.capabilityTitle}`,
                      `שלום ${p.learnerName} ו${p.mentorName},\n\nחשבנו על צמד למידה משותפת ביכולת «${p.capabilityTitle}».\n${p.mentorName} — מוכנה ללמד.\n${p.learnerName} — רוצה ללמוד.\n\nתאמו ביניכן מועד קצר 1:1.\n\nנבחרת`,
                    )}
                  >
                    מייל
                  </button>
                </div>
              ))}
            </div>
          )}
          {!!donePairs.length && (
            <div className="clay compact-card" style={{ marginTop: 10 }}>
              <div className="small muted" style={{ marginBottom: 6 }}>הושלמו ({donePairs.length})</div>
              {donePairs.map((p) => (
                <div key={p.id} className="pair-row done">
                  <span>
                    <strong>{p.learnerName}</strong>
                    <span className="muted"> ← </span>
                    {p.mentorName}
                  </span>
                  <span className="small muted">{p.capabilityTitle}</span>
                  <PairDoneCheck pair={p} />
                </div>
              ))}
            </div>
          )}
          {!!pairing.unmatched.length && (
            <div className="clay compact-card" style={{ marginTop: 10 }}>
              <div className="small muted" style={{ marginBottom: 6 }}>מחכות למלמדת</div>
              {pairing.unmatched.map((u, i) => (
                <div key={`${u.name}-${i}`} className="pair-row">
                  <span>{u.name}</span>
                  <span className="small muted">{u.capabilityTitle}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "meetings" && (
        <section className="compact-stack">
          {!data.meetings.length && <p>אין מפגשים. מוסיפים בתוכן → מפגשים, כולל קישור כניסה.</p>}
          {data.meetings
            .slice()
            .sort((a, b) => a.datetime.localeCompare(b.datetime))
            .map((m) => {
              const coming = data.rsvps.filter((r) => r.meetingId === m.id && r.planningToAttend);
              const came = data.rsvps.filter((r) => r.meetingId === m.id && r.attended);
              const comingTeachers = coming.map((r) => findTeacher(data, r.teacherId)).filter(Boolean);
              const emails = coming.map((r) => teacherEmail(data, r.teacherId));
              const link = m.joinUrl || (m.location.startsWith("http") ? m.location : "");
              const body = [
                `שלום,`,
                ``,
                `תזכורת למפגש «${m.title}».`,
                formatHebDate(m.datetime),
                m.location ? `מקום: ${m.location}` : "",
                link ? `קישור כניסה: ${link}` : "",
                m.description,
                ``,
                `נבחרת`,
              ].filter((line) => line !== "").join("\n");
              const open = openMeet === m.id;
              return (
                <article key={m.id} className="clay compact-card">
                  <button className="compact-head" onClick={() => setOpenMeet(open ? null : m.id)}>
                    <span>
                      <strong>{m.title}</strong>
                      <span className="small muted"> {m.topic}</span>
                    </span>
                    <span className="small muted">
                      {coming.length} מגיעות · {came.length} השתתפו
                    </span>
                  </button>
                  <p className="small compact-hint">{formatHebDate(m.datetime)}{m.location ? ` · ${m.location}` : ""}</p>
                  {open && (
                    <div className="compact-body">
                      {link && <p className="small"><a href={link} dir="ltr" target="_blank" rel="noreferrer">{link}</a></p>}
                      {!!comingTeachers.length && (
                        <p className="small"><strong>מגיעות: </strong>{comingTeachers.map((t) => `${t!.firstName} ${t!.lastName}`).join(" · ")}</p>
                      )}
                      <div className="row" style={{ marginTop: 6 }}>
                        <button className="pill btn-ink small" disabled={!emails.length} onClick={() => openMail(emails, m.title, body)}>
                          מייל
                        </button>
                        <button className="pill btn-primary small" disabled={!emails.length} onClick={() => void ping(emails.join(", "))}>
                          העתקת מיילים
                        </button>
                        {link && (
                          <button className="pill btn-yellow small" onClick={() => void ping(link)}>העתקת קישור</button>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
        </section>
      )}
    </GoogleGate>
  );
}
