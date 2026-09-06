import { useMemo, useState } from "react";
import { navigate } from "../app/router";
import { useStore } from "../app/store";
import { GoogleSignButton } from "../components/GoogleSignButton";

function startsWithHeb(name: string, q: string): boolean {
  return name.replace(/['״"׳]/g, "").startsWith(q);
}

export function Who() {
  const { data, enterForm } = useStore();
  const institutionId = sessionStorage.getItem("nivheret-institution") ?? data.institutions[0]?.id;
  const teachers = data.teachers.filter((t) => t.institutionId === institutionId);
  const [mode, setMode] = useState<"email" | "list">("email");
  const [email, setEmail] = useState("");
  const [q, setQ] = useState("");

  const byEmail = teachers.find((t) => t.email.toLowerCase() === email.trim().toLowerCase());
  const filtered = useMemo(() => {
    const s = q.trim();
    if (!s) return teachers.slice().sort((a, b) => a.firstName.localeCompare(b.firstName, "he")).slice(0, 18);
    const low = s.toLowerCase();
    return teachers
      .filter((t) => {
        const full = `${t.firstName} ${t.lastName}`;
        return (
          startsWithHeb(t.firstName, s) ||
          startsWithHeb(t.lastName, s) ||
          startsWithHeb(full, s) ||
          full.includes(s) ||
          t.email.toLowerCase().startsWith(low) ||
          t.email.toLowerCase().includes(low)
        );
      })
      .sort((a, b) => a.firstName.localeCompare(b.firstName, "he"))
      .slice(0, 50);
  }, [q, teachers]);

  const go = (id: string) => {
    const t = teachers.find((x) => x.id === id);
    if (!t || !institutionId) return;
    enterForm(institutionId, t);
    navigate("checklist");
  };

  return (
    <div>
      <button className="small muted" onClick={() => navigate("welcome")}>חזרה למוסד</button>
      <h1 style={{ marginTop: 8 }}>מי את?</h1>
      <p>אפשר להיכנס עם חשבון גוגל, או לזהות את עצמך בלי סיסמה.</p>
      <div className="clay" style={{ padding: 20, margin: "16px 0" }}>
        <GoogleSignButton after={() => navigate("checklist")} />
        <p className="small" style={{ margin: "12px 0 0" }}>מתאים לחשבון האולפנה או ל־Gmail שמופיע בספר המורות.</p>
      </div>
      <p className="small muted">או זיהוי קל:</p>
      <div className="row" style={{ margin: "8px 0 16px" }}>
        <button className={`pill ${mode === "email" ? "btn-yellow" : "btn-primary"}`} onClick={() => setMode("email")}>יש לי את המייל</button>
        <button className={`pill ${mode === "list" ? "btn-yellow" : "btn-primary"}`} onClick={() => setMode("list")}>אמצא את עצמי ברשימה</button>
      </div>

      {mode === "email" ? (
        <div className="clay" style={{ padding: 20 }}>
          <input
            className="field"
            type="email"
            dir="ltr"
            placeholder="name@tzviama.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {email && !byEmail && <p className="small">המייל לא נמצא בספר המורות. נסי חיפוש לפי שם.</p>}
          <button className="pill btn-ink" style={{ marginTop: 14 }} disabled={!byEmail} onClick={() => go(byEmail!.id)}>
            כניסה לטופס
          </button>
        </div>
      ) : (
        <div className="clay" style={{ padding: 20 }}>
          <input
            className="field"
            autoFocus
            placeholder="הקלידי אותיות ראשונות — לדוגמה «חפ» או «בן»"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <p className="small">{q ? `${filtered.length} תוצאות` : "הקלידי כדי לסנן את הרשימה"}</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
            {filtered.map((t) => (
              <li key={t.id}>
                <button
                  className="row"
                  style={{ width: "100%", justifyContent: "space-between", padding: "10px 4px" }}
                  onClick={() => go(t.id)}
                >
                  <span>{t.firstName} {t.lastName}</span>
                  <span className="small muted" dir="ltr">{t.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
