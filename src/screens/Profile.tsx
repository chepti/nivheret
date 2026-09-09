import { useMemo, useState } from "react";
import { Bookmark, Sparkles, Users } from "lucide-react";
import { navigate } from "../app/router";
import { useStore } from "../app/store";
import { GoogleGate } from "../components/GoogleGate";
import { ItemThumb } from "../components/ClayIcons";
import { PairDoneCheck } from "../components/PairDoneCheck";
import { teacherBadgeRows } from "../lib/badges";
import { myPairs } from "../lib/leadership";
import { LEARN_HOW_LABEL } from "../lib/status";
import { TeachingPicker } from "../components/TeachingPicker";

export function Profile() {
  const { data, session, teacher, responseOf } = useStore();
  const [showAllLearn, setShowAllLearn] = useState(false);
  const [showAllSaved, setShowAllSaved] = useState(false);
  if (!session) return null;

  const mine = useMemo(() => {
    const ids = new Set([session.teacherId.toLowerCase(), session.email.toLowerCase()]);
    return data.responses.filter((r) => ids.has(r.teacherId.toLowerCase()));
  }, [data.responses, session]);

  const badgeRows = useMemo(
    () => teacherBadgeRows({ ...data, responses: mine }, session.teacherId),
    [data, mine, session.teacherId],
  );

  const learn = data.capabilities.filter((c) => mine.some((r) => r.capabilityId === c.id && r.wantToLearn));
  const saved = data.capabilities.filter((c) => mine.some((r) => r.capabilityId === c.id && r.savedForLater));
  const learnView = showAllLearn ? learn : learn.slice(0, 3);
  const savedView = showAllSaved ? saved : saved.slice(0, 3);
  const pairs = useMemo(() => myPairs(data, session.teacherId), [data, session.teacherId]);

  return (
    <GoogleGate>
      <h1>שלום {teacher?.firstName ?? ""}</h1>
      <p dir="ltr" className="small">{session.email}</p>
      <TeachingPicker embedded />

      <section className="clay" style={{ padding: 18, marginTop: 12 }}>
        <h2><Sparkles size={18} /> באדג׳ים</h2>
        <p className="small">צבעוני = הושג. השאר מחכים בשחור־לבן.</p>
        <div className="badge-row">
          {badgeRows.map(({ badge, earned, text }) => (
            <article key={badge.id} className={`badge-cell ${earned ? "earned" : ""}`} title={text}>
              {badge.image ? (
                <img src={badge.image} alt="" className="badge-face" />
              ) : (
                <div className="badge-face placeholder">{badge.title[0]}</div>
              )}
              <strong>{badge.title}</strong>
              <span className="small muted">{text}</span>
            </article>
          ))}
        </div>
      </section>

      {!!pairs.length && (
        <section className="clay" style={{ padding: 18, marginTop: 12 }}>
          <h2><Users size={18} /> צמדי למידה</h2>
          <p className="small">אפשר לסמן כאן או בצ׳קליסט שהמפגש 1:1 כבר קרה.</p>
          {pairs.map((p) => {
            const me = session.teacherId.toLowerCase();
            const other = p.learnerId.toLowerCase() === me ? p.mentorName : p.learnerName;
            const role = p.learnerId.toLowerCase() === me ? "לומד עם" : "מלמד את";
            return (
              <div key={p.id} className="profile-item">
                <div className="cap-line-text">
                  <strong>{p.capabilityTitle}</strong>
                  <span className="small muted">{role} {other}</span>
                </div>
                <PairDoneCheck pair={p} label={p.done ? "קיימנו ✓" : "קיימנו 1:1"} />
              </div>
            );
          })}
        </section>
      )}

      <section className="clay" style={{ padding: 18, marginTop: 12 }}>
        <h2>רוצה ללמוד</h2>
        <p className="small">מה שסימנת בצ׳קליסט כ«רוצה ללמוד».</p>
        {learnView.length === 0 && <p>עוד לא סימנת יכולות ללמידה בטופס.</p>}
        {learnView.map((c) => {
          const tool = data.tools.find((t) => t.id === c.toolId);
          const how = responseOf(c.id).learnHow;
          const lesson = data.lessons.find((l) => l.capabilityId === c.id);
          const pic = c.image || tool?.image;
          return (
            <div key={c.id} className="profile-item">
              <div className="cap-line">
                {pic && <ItemThumb image={pic} size={56} shape="free" />}
                <span className="cap-line-text">
                  <strong>{c.title}</strong>
                  <span className="small muted">{[tool?.name, how ? LEARN_HOW_LABEL[how] : null].filter(Boolean).join(" · ")}</span>
                </span>
              </div>
              {lesson && (
                <button className="pill btn-yellow small" onClick={() => navigate("lesson", lesson.id)}>לשיעור</button>
              )}
            </div>
          );
        })}
        {learn.length > 3 && (
          <button className="pill btn-primary" onClick={() => setShowAllLearn((v) => !v)}>
            {showAllLearn ? "הציגו פחות" : `הציגו עוד (${learn.length - 3})`}
          </button>
        )}
      </section>

      <section className="clay" style={{ padding: 18, marginTop: 12 }}>
        <h2><Bookmark size={18} /> שמור ללמידה בהמשך</h2>
        {savedView.length === 0 && <p>אין פריטים שמורים עדיין.</p>}
        {savedView.map((c) => {
          const tool = data.tools.find((t) => t.id === c.toolId);
          const pic = c.image || tool?.image;
          const lesson = data.lessons.find((l) => l.capabilityId === c.id);
          return (
            <div key={c.id} className="profile-item">
              <div className="cap-line">
                {pic && <ItemThumb image={pic} size={56} shape="free" />}
                <span className="cap-line-text">
                  <strong>{c.title}</strong>
                  {tool && <span className="small muted">{tool.name}</span>}
                </span>
              </div>
              {lesson && (
                <button className="pill btn-yellow small" onClick={() => navigate("lesson", lesson.id)}>לשיעור</button>
              )}
            </div>
          );
        })}
        {saved.length > 3 && (
          <button className="pill btn-primary" onClick={() => setShowAllSaved((v) => !v)}>
            {showAllSaved ? "הציגו פחות" : "הציגו את כל הפריטים ללמידה"}
          </button>
        )}
      </section>
    </GoogleGate>
  );
}
