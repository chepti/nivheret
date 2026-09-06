import {
  BookOpenCheck,
  GraduationCap,
  CalendarDays,
  UserRound,
  ChartNoAxesCombined,
  SlidersHorizontal,
} from "lucide-react";
import { navigate, type Route } from "../app/router";
import { useStore } from "../app/store";
import type { RouteName } from "../lib/types";

const TABS: { name: RouteName; label: string; icon: typeof UserRound }[] = [
  { name: "checklist", label: "צ׳קליסט", icon: BookOpenCheck },
  { name: "learn", label: "למידה", icon: GraduationCap },
  { name: "meetings", label: "מפגשים", icon: CalendarDays },
  { name: "profile", label: "פרופיל", icon: UserRound },
];

const ADMIN_TABS: typeof TABS = [
  { name: "admin", label: "הנהלה", icon: ChartNoAxesCombined },
  { name: "cms", label: "תוכן", icon: SlidersHorizontal },
];

export function Shell({ route, children }: { route: Route; children: React.ReactNode }) {
  const { session, isAdmin, teacher, logout, linkGoogle, firebaseOn } = useStore();
  const showNav = Boolean(session) && route.name !== "welcome" && route.name !== "who";
  const tabs = isAdmin ? [...TABS, ...ADMIN_TABS] : TABS;
  const needGoogle = Boolean(session && firebaseOn && !session.googleLinked);

  return (
    <>
      {session && showNav && (
        <header className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div className="small muted">נבחרת · תשפ״ז</div>
            <strong>{teacher ? `${teacher.firstName} ${teacher.lastName}` : session.email}</strong>
          </div>
          <div className="row">
            {needGoogle && (
              <button className="pill btn-yellow small" onClick={() => { void linkGoogle(); }}>
                כניסה עם גוגל
              </button>
            )}
            <button className="pill btn-primary small" onClick={() => { logout(); navigate("welcome"); }}>
              יציאה
            </button>
          </div>
        </header>
      )}
      {children}
      {showNav && (
        <nav className="bottom-nav" aria-label="ניווט ראשי">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = route.name === t.name || (t.name === "learn" && route.name === "lesson");
            return (
              <button key={t.name} className={`nav-item ${active ? "active" : ""}`} onClick={() => navigate(t.name)}>
                <span className="dot"><Icon size={20} strokeWidth={2} /></span>
                {t.label}
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}
