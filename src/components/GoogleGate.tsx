import { useEffect, type ReactNode } from "react";
import { navigate } from "../app/router";
import { useStore } from "../app/store";
import { GoogleSignButton } from "./GoogleSignButton";

export function GoogleGate({ children }: { children: ReactNode }) {
  const { session, isAuthedBeyondForm, firebaseOn, teacher } = useStore();

  useEffect(() => {
    if (!session) navigate("welcome");
  }, [session]);

  if (!session) return null;
  if (isAuthedBeyondForm) return <>{children}</>;

  return (
    <div className="clay" style={{ padding: 22, textAlign: "center" }}>
      <h2>כניסת גוגל</h2>
      <p>
        הטופס נפתח בזיהוי פשוט. מכאן והלאה — למידה, פרופיל ומפגשים — נכנסים עם חשבון גוגל
        {teacher ? ` (${teacher.email})` : ""}.
      </p>
      {!firebaseOn && (
        <p className="small">אפשר להמשיך עם המייל שזיהית.</p>
      )}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <GoogleSignButton />
      </div>
    </div>
  );
}
