import { useState } from "react";
import { Award, Bookmark, Sparkles } from "lucide-react";
import { navigate } from "../app/router";
import { useStore } from "../app/store";
import { GoogleGate } from "../components/GoogleGate";
import { badgeById } from "../lib/badges";

export function Profile() {
  const { data, session, teacher, myBadges, responseOf } = useStore();
  const [showAllLearn, setShowAllLearn] = useState(false);
  const [showAllSaved, setShowAllSaved] = useState(false);
  if (!session) return null;

  const learn = data.capabilities.filter((c) => responseOf(c.id).wantToLearn);
  const saved = data.capabilities.filter((c) => responseOf(c.id).savedForLater);
  const learnView = showAllLearn ? learn : learn.slice(0, 3);
  const savedView = showAllSaved ? saved : saved.slice(0, 3);

  return (
    <GoogleGate>
      <h1>שלום {teacher?.firstName ?? ""}</h1>
      <p dir="ltr" className="small">{session.email}</p>

      <section className="clay" style={{ padding: 18, marginTop: 12 }}>
        <h2><Sparkles size={18} /> באדג׳ים</h2>
        <div className="row">
          {data.badges.map((b) => {
            const on = myBadges.includes(b.id);
            return (
              <span key={b.id} className="badge-chip" style={{ opacity: on ? 1 : 0.4 }} title={b.description}>
                <Award size={14} /> {b.title}
              </span>
            );
          })}
        </div>
        {myBadges[0] && <p className="small">{badgeById(data, myBadges[0])?.description}</p>}
      </section>

      <section className="clay" style={{ padding: 18, marginTop: 12 }}>
        <h2>רוצה ללמוד</h2>
        {learnView.length === 0 && <p>עוד לא סימנת יכולות ללמידה בטופס.</p>}
        {learnView.map((c) => (
          <div key={c.id} className="row" style={{ justifyContent: "space-between", padding: "8px 0" }}>
            <span>{c.title}</span>
            {data.lessons.some((l) => l.capabilityId === c.id) && (
              <button className="small" onClick={() => navigate("lesson", data.lessons.find((l) => l.capabilityId === c.id)!.id)}>לשיעור</button>
            )}
          </div>
        ))}
        {learn.length > 3 && (
          <button className="pill btn-primary" onClick={() => setShowAllLearn((v) => !v)}>
            {showAllLearn ? "הצגי פחות" : `הצגי עוד (${learn.length - 3})`}
          </button>
        )}
      </section>

      <section className="clay" style={{ padding: 18, marginTop: 12 }}>
        <h2><Bookmark size={18} /> שמור ללמידה בהמשך</h2>
        {savedView.length === 0 && <p>אין פריטים שמורים עדיין.</p>}
        {savedView.map((c) => <div key={c.id} style={{ padding: "8px 0" }}>{c.title}</div>)}
        {saved.length > 3 && (
          <button className="pill btn-primary" onClick={() => setShowAllSaved((v) => !v)}>
            {showAllSaved ? "הצגי פחות" : "הצגי את כל הפריטים ללמידה"}
          </button>
        )}
      </section>
    </GoogleGate>
  );
}
