import { useState } from "react";
import { useStore } from "../app/store";
import { googleErrorMessage } from "../lib/firebase";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8c-.2 1.1-.9 2.1-1.9 2.7v2.2h3.1c1.8-1.7 2.6-4.1 2.6-6.5z" />
      <path fill="#34A853" d="M9 18c2.6 0 4.8-.9 6.4-2.3l-3.1-2.2c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.4-4H.4v2.3C2 16 5.2 18 9 18z" />
      <path fill="#FBBC05" d="M3.6 10.4c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V4.3H.4C-.1 5.5-.4 6.8-.4 8.5s.3 3 .8 4.2l3.2-2.3z" />
      <path fill="#EA4335" d="M9 3.6c1.4 0 2.7.5 3.7 1.4l2.8-2.8C13.8.9 11.6 0 9 0 5.2 0 2 2 0.4 4.3l3.2 2.3C4.4 5.3 6.5 3.6 9 3.6z" />
    </svg>
  );
}

export function GoogleSignButton({
  label = "כניסה עם גוגל",
  after,
}: {
  label?: string;
  after?: () => void;
}) {
  const { enterWithGoogle, firebaseOn } = useStore();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (!firebaseOn) return null;

  return (
    <div>
      <button
        className="pill btn-google"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setErr("");
          try {
            const result = await enterWithGoogle();
            if (!result.ok) setErr(result.error);
            else after?.();
          } catch (e) {
            setErr(googleErrorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        <GoogleMark />
        {busy ? "מתחברים לגוגל…" : label}
      </button>
      {err && <p className="small" style={{ color: "#c0392b", marginTop: 10 }}>{err}</p>}
    </div>
  );
}
