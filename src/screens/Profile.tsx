import { useMemo, useState } from "react";
import { Award, Bookmark, Sparkles } from "lucide-react";
import { navigate } from "../app/router";
import { useStore } from "../app/store";
import { GoogleGate } from "../components/GoogleGate";
import { LEARN_HOW_LABEL } from "../lib/status";

export function Profile() {
  const { data, session, teacher, myBadges, responseOf } = useStore();
  const [showAllLearn, setShowAllLearn] = useState(false);
  const [showAllSaved, setShowAllSaved] = useState(false);
  if (!session) return null;

  const mine = useMemo(() => {
    const ids = new Set([session.teacherId.toLowerCase(), session.email.toLowerCase()]);
    return data.responses.filter((r) => ids.has(r.teacherId.toLowerCase()));
  }, [data.responses, session]);

  const learn = data.capabilities.filter((c) => mine.some((r) => r.capabilityId === c.id && r.wantToLearn));
  const saved = data.capabilities.filter((c) => mine.some((r) => r.capabilityId === c.id && r.savedForLater));
  const learnView = showAllLearn ? learn : learn.slice(0, 3);
  const savedView = showAllSaved ? saved : saved.slice(0, 3);

  return (
    <GoogleGate>
      <h1>שלום {teacher?.firstName ?? ""}</h1>
      <p dir="ltr" className="small">{session.email}</p>

      <section className="clay" style={{ padding: 18, marginTop: 12 }}>
        <h2><Sparkles size={18} /> באדג׳ים</h2>
        <div className="row">
          {data.badges.filter((b) => myBadges.includes(b.id)).map((b) => (
            <span key={b.id} className="badge-chip" title={b.description}>
              <Award size={14} /> {b.title}
            </span>
          ))}
        </div>
        {myBadges.length === 0 && <p>הבאדג׳ים יופיעו אחרי הסימונים הראשונים בטופס.</p>}
      </section>

      <section className="clay" style={{ padding: 18, marginTop: 12 }}>
        <h2>רוצה ללמוד</h2>
        <p className="small">מה שסימנת בצ׳קליסט כ«רוצה ללמוד».</p>
        {learnView.length === 0 && <p>עוד לא סימנת יכולות ללמידה בטופס.</p>}
        {learnView.map((c) => {
          const tool = data.tools.find((t) => t.id === c.toolId);
          const how = responseOf(c.id).learnHow;
          const lesson = data.lessons.find((l) => l.capabilityId === c.id);
          return (
            <div key={c.id} className="profile-item">
              <div>
                <strong>{c.title}</strong>
                <div className="small muted">{[tool?.name, how ? LEARN_HOW_LABEL[how] : null].filter(Boolean).join(" · ")}</div>
              </div>
              {lesson && (
                <button className="pill btn-yellow small" onClick={() => navigate("lesson", lesson.id)}>לשיעור</button>
              )}
            </div>
          );
        })}
        {learn.length > 3 && (
          <button className="pill btn-primary" onClick={() => setShowAllLearn((v) => !v)}>
            {showAllLearn ? "הצגי פחות" : `הצגי עוד (${learn.length - 3})`}
          </button>
        )}
      </section>

      <section className="clay" style={{ padding: 18, marginTop: 12 }}>
        <h2><Bookmark size={18} /> שמור ללמידה בהמשך</h2>
        {savedView.length === 0 && <p>אין פריטים שמורים עדיין.</p>}
        {savedView.map((c) => (
          <div key={c.id} className="profile-item">
            <strong>{c.title}</strong>
          </div>
        ))}
        {saved.length > 3 && (
          <button className="pill btn-primary" onClick={() => setShowAllSaved((v) => !v)}>
            {showAllSaved ? "הצגי פחות" : "הצגי את כל הפריטים ללמידה"}
          </button>
        )}
      </section>
    </GoogleGate>
  );
}
