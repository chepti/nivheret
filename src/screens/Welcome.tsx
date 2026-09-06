import { useState } from "react";
import { Sparkles } from "lucide-react";
import { navigate } from "../app/router";
import { useStore } from "../app/store";
import { GoogleSignButton } from "../components/GoogleSignButton";

export function Welcome() {
  const { data, firebaseOn, syncReady } = useStore();
  const [symbol, setSymbol] = useState(data.institutions[0]?.symbol ?? "");
  const match = data.institutions.find((i) => i.symbol === symbol.trim());

  return (
    <div className="center" style={{ paddingTop: 28 }}>
      <div className="clay-yellow clay" style={{ width: 88, height: 88, borderRadius: "50%", margin: "0 auto 18px", display: "grid", placeItems: "center" }}>
        <Sparkles size={36} />
      </div>
      <h1>נבחרת</h1>
      <p>למידה צוותית · יכולות דיגיטליות · מפגשים</p>
      <p className="small" style={{ color: firebaseOn ? "var(--mastered)" : "var(--teach)" }}>
        {firebaseOn
          ? syncReady
            ? "מחובר ל־Firebase — הסימונים נשמרים לענן"
            : "מתחבר ל־Firebase…"
          : "Firebase לא מחובר — בודקים את קובץ ‎.env"}
      </p>
      <div className="clay" style={{ padding: 22, marginTop: 22, textAlign: "right" }}>
        <h2>בחירת סמל מוסד</h2>
        <p className="small">בחרי מהרשימה או הקלידי את הסמל.</p>
        <select className="field" value={symbol} onChange={(e) => setSymbol(e.target.value)} style={{ marginBottom: 12 }}>
          {data.institutions.map((i) => (
            <option key={i.id} value={i.symbol}>{i.symbol} · {i.name}</option>
          ))}
        </select>
        <input className="field" inputMode="numeric" placeholder="סמל מוסד" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
        {match ? (
          <p style={{ color: "var(--ink)", marginTop: 12 }}>{match.name}</p>
        ) : (
          <p className="small">הסמל לא נמצא ברשימה.</p>
        )}
        <button
          className="pill btn-ink"
          style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
          disabled={!match}
          onClick={() => {
            sessionStorage.setItem("nivheret-institution", match!.id);
            navigate("who");
          }}
        >
          המשך
        </button>
        <div className="google-split">או</div>
        <GoogleSignButton label="כניסה עם חשבון גוגל" after={() => navigate("checklist")} />
      </div>
    </div>
  );
}
