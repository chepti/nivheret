import { useMemo, useState } from "react";
import { navigate } from "../app/router";
import { useStore } from "../app/store";

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
    if (!s) return teachers.slice(0, 20);
    return teachers
      .filter((t) => `${t.firstName} ${t.lastName} ${t.email}`.includes(s))
      .slice(0, 40);
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
      <p>אין צורך בסיסמה — רק לזהות את המייל האולפניסטי.</p>
      <div className="row" style={{ margin: "16px 0" }}>
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
          <input className="field" placeholder="חיפוש שם או מייל" value={q} onChange={(e) => setQ(e.target.value)} />
          <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
            {filtered.map((t) => (
              <li key={t.id}>
                <button
                  className="row"
                  style={{ width: "100%", justifyContent: "space-between", padding: "10px 4px", borderBottom: "1px solid #f3ead6" }}
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
