import { useMemo, useState } from "react";
import { useStore } from "../app/store";
import { GoogleGate } from "../components/GoogleGate";
import { HeatMap } from "../viz/HeatMap";
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

type Tab = "teach" | "pairs" | "meetings" | "map";

export function AdminDash() {
  const { data, isAdmin } = useStore();
  const [tab, setTab] = useState<Tab>("teach");
  const [flash, setFlash] = useState("");

  const insights = useMemo(() => capabilityInsights(data), [data]);
  const pairing = useMemo(() => suggestedPairs(data), [data]);
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
      <p>{active} מורות ענו בטופס מתוך {data.teachers.length}. כאן רואים שמות, העדפות למידה, צמדים ומפגשים.</p>

      <div className="cms-tabs" style={{ margin: "12px 0 16px" }}>
        <button className={tab === "teach" ? "on" : ""} onClick={() => setTab("teach")}>מה ללמד</button>
        <button className={tab === "pairs" ? "on" : ""} onClick={() => setTab("pairs")}>שידוך צמדים</button>
        <button className={tab === "meetings" ? "on" : ""} onClick={() => setTab("meetings")}>מפגשים</button>
        <button className={tab === "map" ? "on" : ""} onClick={() => setTab("map")}>מפה</button>
      </div>

      {tab === "teach" && (
        <section>
          {!insights.length && <p>עוד אין סימונים מדויקים. ברגע שמורות ימלאו — יופיעו כאן שמות ואיך הן רוצות ללמוד.</p>}
          {insights.map((row) => (
            <article key={row.cap.id} className="clay" style={{ padding: 16, marginBottom: 12 }}>
              <div className="small muted">{row.toolName}</div>
              <h2>{row.cap.title}</h2>
              <p style={{ color: "var(--ink)" }}>{row.suggest}</p>
              <div className="row" style={{ marginBottom: 8 }}>
                <span className="badge-chip">{row.want.length} רוצות ללמוד</span>
                <span className="badge-chip">{row.teach.length} מלמדות</span>
                <span className="badge-chip">{row.product.length} עם תוצר</span>
              </div>
              {(Object.keys(LEARN_HOW_LABEL) as LearnHow[]).some((k) => row.howCounts[k]) && (
                <p className="small">
                  איך ללמד:{" "}
                  {(Object.keys(LEARN_HOW_LABEL) as LearnHow[])
                    .filter((k) => row.howCounts[k])
                    .map((k) => `${LEARN_HOW_LABEL[k]} — ${row.howCounts[k]}`)
                    .join(" · ")}
                </p>
              )}
              {!!row.want.length && (
                <div className="name-list">
                  <strong>רוצות ללמוד</strong>
                  {row.want.map((w) => (
                    <div key={w.id} className="name-row">
                      <span>{w.name}</span>
                      <span className="small muted">{w.how ? LEARN_HOW_LABEL[w.how] : "לא ציינה איך"}</span>
                    </div>
                  ))}
                </div>
              )}
              {!!row.teach.length && (
                <div className="name-list">
                  <strong>מוכנות ללמד</strong>
                  {row.teach.map((t) => <div key={t.id} className="name-row">{t.name}</div>)}
                </div>
              )}
              {!!row.product.length && (
                <div className="name-list">
                  <strong>יש תוצר</strong>
                  {row.product.map((p) => (
                    <div key={p.id} className="name-row">
                      <span>{p.name}</span>
                      {p.url && <a className="small" href={p.url} target="_blank" rel="noreferrer" dir="ltr">{p.url}</a>}
                    </div>
                  ))}
                </div>
              )}
              <div className="row" style={{ marginTop: 10 }}>
                <button
                  className="pill btn-primary small"
                  onClick={() => openMail(
                    row.want.map((w) => teacherEmail(data, w.id)),
                    `למידה: ${row.cap.title}`,
                    `שלום,\n\nנראה שיש עניין ביכולת «${row.cap.title}».\n${row.suggest}\n\nנבחרת`,
                  )}
                >
                  מייל לרוצות ללמוד
                </button>
                <button
                  className="pill btn-yellow small"
                  onClick={() => void ping(row.want.map((w) => teacherEmail(data, w.id)).join(", "))}
                >
                  העתקת מיילים
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {tab === "pairs" && (
        <section>
          <p>כל צמד: מורה שרוצה ללמוד + מורה שמוכנה ללמד באותה יכולת. אפשר לפתוח מייל לשתיכן.</p>
          {!pairing.pairs.length && <p>אין עדיין גם «רוצה ללמוד» וגם «מלמדת» על אותה יכולת.</p>}
          {pairing.pairs.map((p, i) => (
            <article key={`${p.capabilityId}-${p.learnerId}-${i}`} className="clay" style={{ padding: 14, marginBottom: 10 }}>
              <div className="small muted">{p.capabilityTitle}</div>
              <h2 style={{ fontSize: "1.15rem" }}>{p.learnerName} ← {p.mentorName}</h2>
              <p className="small">{p.mentorName} מלמדת · {p.learnerName} לומדת</p>
              <div className="row">
                <button
                  className="pill btn-ink small"
                  onClick={() => openMail(
                    [teacherEmail(data, p.learnerId), teacherEmail(data, p.mentorId)],
                    `צמד למידה: ${p.capabilityTitle}`,
                    `שלום ${p.learnerName} ו${p.mentorName},\n\nחשבנו על צמד למידה משותפת ביכולת «${p.capabilityTitle}».\n${p.mentorName} — מוכנה ללמד.\n${p.learnerName} — רוצה ללמוד.\n\nתאמו ביניכן מועד קצר 1:1.\n\nנבחרת`,
                  )}
                >
                  מייל לצמד
                </button>
              </div>
            </article>
          ))}
          {!!pairing.unmatched.length && (
            <div className="clay" style={{ padding: 16, marginTop: 12 }}>
              <h2>מחכות למלמדת</h2>
              {pairing.unmatched.map((u, i) => (
                <div key={`${u.name}-${i}`} className="name-row">
                  <span>{u.name}</span>
                  <span className="small muted">{u.capabilityTitle}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "meetings" && (
        <section>
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
              return (
                <article key={m.id} className="clay" style={{ padding: 16, marginBottom: 12 }}>
                  <div className="small muted">{m.topic}</div>
                  <h2>{m.title}</h2>
                  <p>{formatHebDate(m.datetime)} · {m.location || "מקום טרם נקבע"}</p>
                  {link && <p><a href={link} dir="ltr" target="_blank" rel="noreferrer">{link}</a></p>}
                  <p className="small">{coming.length} מתכוונות להגיע · {came.length} סומנו כהשתתפו · {data.teachers.length - coming.length} בלי אישור</p>
                  <div className="name-list">
                    <strong>מגיעות</strong>
                    {!comingTeachers.length && <p className="small">עוד אף אחת לא אישרה הגעה.</p>}
                    {comingTeachers.map((t) => (
                      <div key={t!.id} className="name-row">
                        <span>{t!.firstName} {t!.lastName}</span>
                        <span className="small muted" dir="ltr">{t!.email}</span>
                      </div>
                    ))}
                  </div>
                  <div className="row" style={{ marginTop: 10 }}>
                    <button
                      className="pill btn-ink small"
                      disabled={!emails.length}
                      onClick={() => openMail(emails, m.title, body)}
                    >
                      שלחי קישור למייל
                    </button>
                    <button className="pill btn-primary small" disabled={!emails.length} onClick={() => void ping(emails.join(", "))}>
                      העתקת מיילים
                    </button>
                    {link && (
                      <button className="pill btn-yellow small" onClick={() => void ping(link)}>העתקת קישור</button>
                    )}
                  </div>
                </article>
              );
            })}
        </section>
      )}

      {tab === "map" && (
        <section>
          <div className="clay" style={{ padding: 16, marginBottom: 14 }}>
            <h2>מפת חום</h2>
            <HeatMap />
          </div>
          <h2>לפי כלי</h2>
          <div className="grid-tools">
            {data.tools.filter((t) => data.capabilities.some((c) => c.toolId === t.id)).map((tool) => (
              <ToolOrbit key={tool.id} tool={tool} showNames />
            ))}
          </div>
        </section>
      )}
    </GoogleGate>
  );
}
