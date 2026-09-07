import { useEffect, type ReactNode } from "react";
import { navigate } from "../app/router";
import { useStore } from "../app/store";
import { GoogleSignButton } from "./GoogleSignButton";

export function GoogleGate({ children }: { children: ReactNode }) {
  const { session, isAuthedBeyondForm, teacher } = useStore();

  useEffect(() => {
    if (!session) navigate("welcome");
  }, [session]);

  if (!session) return null;
  if (isAuthedBeyondForm) return <>{children}</>;

  return (
    <div className="clay" style={{ padding: 22, textAlign: "center" }}>
      <h2>כניסת גוגל</h2>
      <p>
        הזיהוי מהרשימה או מהמייל מספיק לטופס. למידה, פרופיל, מפגשים, הנהלה ותוכן — רק עם חשבון גוגל
        {teacher ? ` (${teacher.email})` : ""}.
      </p>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <GoogleSignButton />
      </div>
    </div>
  );
}
