import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { earnedBadgeIds } from "../lib/badges";
import { firebaseEnabled, signInWithGoogle, signOutGoogle } from "../lib/firebase";
import { emptyResponse } from "../lib/status";
import { loadData, loadSession, saveData, saveSession } from "../lib/storage";
import {
  pullRemote,
  pushContent,
  pushReaction,
  pushResponse,
  pushRsvp,
  pushTeacher,
  seedIfEmpty,
  watchShared,
} from "../lib/sync";
import type {
  AppData,
  CapabilityResponse,
  MeetingRsvp,
  Reaction,
  Session,
  Teacher,
} from "../lib/types";

type Store = {
  data: AppData;
  session: Session | null;
  firebaseOn: boolean;
  teacher: Teacher | undefined;
  isAdmin: boolean;
  isAuthedBeyondForm: boolean;
  syncReady: boolean;
  setData: (updater: AppData | ((prev: AppData) => AppData)) => void;
  enterForm: (institutionId: string, teacher: Teacher) => void;
  linkGoogle: () => Promise<string | null>;
  logout: () => void;
  upsertResponse: (patch: Partial<CapabilityResponse> & { capabilityId: string }) => void;
  responseOf: (capabilityId: string, teacherId?: string) => CapabilityResponse;
  upsertRsvp: (patch: Partial<MeetingRsvp> & { meetingId: string }) => void;
  upsertReaction: (patch: Partial<Reaction> & { capabilityId: string }) => void;
  myBadges: string[];
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<AppData>(() => loadData());
  const [session, setSessionState] = useState<Session | null>(() => loadSession());
  const [syncReady, setSyncReady] = useState(!firebaseEnabled());
  const skipRemoteContent = useRef(false);

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    if (!firebaseEnabled()) return;
    let stop = () => {};
    void (async () => {
      try {
        const local = loadData();
        await seedIfEmpty(local);
        const remote = await pullRemote();
        if (remote) {
          setDataState((prev) => ({
            ...prev,
            ...remote,
            teachers: remote.teachers?.length ? remote.teachers : prev.teachers,
            responses: remote.responses ?? prev.responses,
            rsvps: remote.rsvps ?? prev.rsvps,
            reactions: remote.reactions ?? prev.reactions,
          }));
        }
        stop = watchShared((part) => {
          if (skipRemoteContent.current) return;
          setDataState((prev) => ({ ...prev, ...part }));
        });
      } catch (err) {
        console.error("Firebase sync", err);
      } finally {
        setSyncReady(true);
      }
    })();
    return () => stop();
  }, []);

  const setData: Store["setData"] = (updater) => {
    setDataState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (firebaseEnabled()) {
        skipRemoteContent.current = true;
        void pushContent(next).finally(() => {
          window.setTimeout(() => {
            skipRemoteContent.current = false;
          }, 400);
        });
        const changed = next.teachers.filter((t) => {
          const old = prev.teachers.find((x) => x.id === t.id);
          return !old || JSON.stringify(old) !== JSON.stringify(t);
        });
        for (const t of changed) void pushTeacher(t);
      }
      return next;
    });
  };

  const teacher = data.teachers.find((t) => t.id === session?.teacherId);
  const isAdmin = Boolean(
    session &&
      (teacher?.role === "admin" ||
        data.settings.adminEmails.includes(session.email.toLowerCase())),
  );
  const isAuthedBeyondForm = Boolean(session?.googleLinked || isAdmin);

  const enterForm = (institutionId: string, t: Teacher) => {
    const next: Session = {
      institutionId,
      teacherId: t.id,
      email: t.email,
      googleLinked: false,
    };
    setSessionState(next);
    saveSession(next);
  };

  const linkGoogle: Store["linkGoogle"] = async () => {
    if (!session) return null;
    if (!firebaseEnabled()) {
      const next = { ...session, googleLinked: true };
      setSessionState(next);
      saveSession(next);
      return session.email;
    }
    const email = await signInWithGoogle();
    if (!email) return null;
    const match =
      data.teachers.find((t) => t.email.toLowerCase() === email) ??
      data.teachers.find((t) => t.id === session.teacherId);
    if (!match) return email;
    const next: Session = {
      institutionId: match.institutionId,
      teacherId: match.id,
      email: match.email,
      googleLinked: true,
    };
    setSessionState(next);
    saveSession(next);
    return email;
  };

  const logout = () => {
    void signOutGoogle();
    setSessionState(null);
    saveSession(null);
  };

  const upsertResponse: Store["upsertResponse"] = (patch) => {
    if (!session) return;
    const teacherId = session.teacherId;
    setDataState((prev) => {
      const i = prev.responses.findIndex(
        (r) => r.teacherId === teacherId && r.capabilityId === patch.capabilityId,
      );
      const base = i >= 0 ? prev.responses[i] : emptyResponse(teacherId, patch.capabilityId);
      const next = { ...base, ...patch, teacherId, updatedAt: new Date().toISOString() };
      const responses = [...prev.responses];
      if (i >= 0) responses[i] = next;
      else responses.push(next);
      void pushResponse(next);
      return { ...prev, responses };
    });
  };

  const responseOf: Store["responseOf"] = (capabilityId, teacherId) => {
    const id = teacherId ?? session?.teacherId ?? "";
    return (
      data.responses.find((r) => r.teacherId === id && r.capabilityId === capabilityId) ??
      emptyResponse(id, capabilityId)
    );
  };

  const upsertRsvp: Store["upsertRsvp"] = (patch) => {
    if (!session) return;
    const teacherId = session.teacherId;
    setDataState((prev) => {
      const i = prev.rsvps.findIndex((r) => r.teacherId === teacherId && r.meetingId === patch.meetingId);
      const base: MeetingRsvp =
        i >= 0 ? prev.rsvps[i] : { teacherId, meetingId: patch.meetingId, planningToAttend: false, attended: false };
      const next = { ...base, ...patch, teacherId };
      const rsvps = [...prev.rsvps];
      if (i >= 0) rsvps[i] = next;
      else rsvps.push(next);
      void pushRsvp(next);
      return { ...prev, rsvps };
    });
  };

  const upsertReaction: Store["upsertReaction"] = (patch) => {
    if (!session) return;
    const teacherId = session.teacherId;
    setDataState((prev) => {
      const i = prev.reactions.findIndex(
        (r) => r.teacherId === teacherId && r.capabilityId === patch.capabilityId,
      );
      const base: Reaction =
        i >= 0
          ? prev.reactions[i]
          : { teacherId, capabilityId: patch.capabilityId, liked: false, createdAt: new Date().toISOString() };
      const next = { ...base, ...patch, teacherId };
      const reactions = [...prev.reactions];
      if (i >= 0) reactions[i] = next;
      else reactions.push(next);
      void pushReaction(next);
      return { ...prev, reactions };
    });
  };

  const myBadges = useMemo(
    () => (session ? earnedBadgeIds(data, session.teacherId) : []),
    [data, session],
  );

  const value: Store = {
    data,
    session,
    firebaseOn: firebaseEnabled(),
    teacher,
    isAdmin,
    isAuthedBeyondForm,
    syncReady,
    setData,
    enterForm,
    linkGoogle,
    logout,
    upsertResponse,
    responseOf,
    upsertRsvp,
    upsertReaction,
    myBadges,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore מחוץ ל־Provider");
  return ctx;
}
