import { Cloud, CloudOff, Loader2, CloudCheck } from "lucide-react";
import { useStore } from "../app/store";

const LABEL = {
  loading: "מתחבר",
  idle: "שמירה אוטומטית",
  saving: "שומר",
  saved: "נשמר",
  error: "השמירה נכשלה",
} as const;

export function CloudSyncIcon({ size = 20 }: { size?: number }) {
  const { firebaseOn, syncReady, cloudSave } = useStore();
  const state = !firebaseOn ? "error" : !syncReady ? "loading" : cloudSave === "idle" ? "idle" : cloudSave;
  const label = LABEL[state];

  return (
    <span className={`cloud-sync ${state}`} title={label} aria-label={label} role="status">
      {state === "loading" || state === "saving" ? (
        <Loader2 size={size} strokeWidth={2} />
      ) : state === "saved" ? (
        <CloudCheck size={size} strokeWidth={2} />
      ) : state === "error" ? (
        <CloudOff size={size} strokeWidth={2} />
      ) : (
        <Cloud size={size} strokeWidth={2} />
      )}
    </span>
  );
}
