import { useEffect, useState, type ReactNode } from "react";
import { navigate } from "../app/router";
import { useStore } from "../app/store";

export function GoogleGate({ children }: { children: ReactNode }) {
  const { session, isAuthedBeyondForm, isAdmin, linkGoogle, firebaseOn, teacher } = useStore();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) navigate("welcome");
  }, [session]);

  if (!session) return null;
  if (isAuthedBeyondForm) return <>{children}</>;

  return (
    <div className="clay" style={{ padding: 22, textAlign: "center" }}>
      <h2>כניסת גוגל</h2>
      <p>
        הטופס נפתח בזיהוי פשוט. מכאן והלאה — למידה, פרופיל ומפגשים — נכנסות עם החשבון האולפניסטי
        {teacher ? ` (${teacher.email})` : ""}.
      </p>
      {!firebaseOn && (
        <p className="small">Firebase עדיין לא מחובר. בהדגמה המקומית נאשר את אותו מייל בלי חלון גוגל.</p>
      )}
      {err && <p style={{ color: "var(--teach)" }}>{err}</p>}
      <button
        className="pill btn-ink"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setErr("");
          try {
            const email = await linkGoogle();
            if (!email) setErr("הכניסה לא הושלמה.");
          } catch {
            setErr("לא הצלחנו להתחבר לגוגל.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {firebaseOn ? "כניסה עם גוגל" : "המשיכי עם המייל שזיהית"}
      </button>
      {isAdmin && <p className="small">חשבון אדמין יפתח גם את דשבורד ההנהלה וה־CMS.</p>}
    </div>
  );
}
