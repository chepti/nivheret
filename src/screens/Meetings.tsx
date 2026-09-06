import { Bell, HousePlus } from "lucide-react";
import { useStore } from "../app/store";
import { GoogleGate } from "../components/GoogleGate";
import { formatHebDate } from "../lib/status";

export function Meetings() {
  const { data, session, upsertRsvp } = useStore();
  if (!session) return null;

  const remindInstall = async () => {
    alert("באנדרואיד: תפריט הדפדפן → הוספה למסך הבית. באייפון: שיתוף → הוסף למסך הבית.");
  };
  const remindNotify = async () => {
    if (!("Notification" in window)) {
      alert("הדפדפן לא תומך בהתראות.");
      return;
    }
    await Notification.requestPermission();
  };

  return (
    <GoogleGate>
      <h1>מפגשי צוות</h1>
      <p>מפגשי צוות שההנהלה פותחת כאן באפליקציה.</p>
      <div className="row" style={{ marginBottom: 12 }}>
        <button className="pill btn-primary" onClick={() => void remindNotify()}><Bell size={16} /> הפעילי תזכורות</button>
        <button className="pill btn-yellow" onClick={() => void remindInstall()}><HousePlus size={16} /> שמרי במסך הבית</button>
      </div>
      {data.meetings.map((m) => {
        const rsvp = data.rsvps.find((r) => r.teacherId === session.teacherId && r.meetingId === m.id);
        return (
          <article key={m.id} className="clay" style={{ padding: 16, marginBottom: 12 }}>
            <div className="small muted">{m.topic}</div>
            <h2>{m.title}</h2>
            <p>{formatHebDate(m.datetime)} · {m.location}</p>
            {m.joinUrl && (
              <p><a href={m.joinUrl} dir="ltr" target="_blank" rel="noreferrer">קישור כניסה</a></p>
            )}
            <p style={{ color: "var(--ink)" }}>{m.description}</p>
            <div className="row">
              <button
                className={`pill ${rsvp?.planningToAttend ? "btn-yellow" : "btn-primary"}`}
                onClick={() => upsertRsvp({ meetingId: m.id, planningToAttend: !rsvp?.planningToAttend })}
              >
                {rsvp?.planningToAttend ? "מתכוונת להגיע ✓" : "אני מתכוונת להגיע"}
              </button>
              <button
                className={`pill ${rsvp?.attended ? "btn-ink" : "btn-primary"}`}
                onClick={() => upsertRsvp({ meetingId: m.id, attended: !rsvp?.attended })}
              >
                {rsvp?.attended ? "השתתפתי ✓" : "השתתפתי"}
              </button>
            </div>
          </article>
        );
      })}
    </GoogleGate>
  );
}
