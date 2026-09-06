import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { earnedBadgeIds, normalizeBadge } from "../lib/badges";
import { completeGoogleRedirect, firebaseEnabled, signInWithGoogle, signOutGoogle } from "../lib/firebase";
import { emptyResponse } from "../lib/status";
import { dropUnwantedContent, loadData, loadSession, normalizeContent, saveData, saveSession, unionCapabilities, unionLessons } from "../lib/storage";
import {
  deleteTeacher,
  pullRemote,
  pushContent,
  pushPair,
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
  LearningPair,
  MeetingRsvp,
  Reaction,
  Session,
  Teacher,
} from "../lib/types";

const CONTENT_KEYS = [
  "institutions",
  "periods",
  "tools",
  "capabilities",
  "lessons",
  "meetings",
  "badges",
  "settings",
] as const;

function isContentPart(part: Partial<AppData>): boolean {
  return CONTENT_KEYS.some((k) => k in part);
}

function newerStamp(a?: string, b?: string): boolean {
  return Boolean(a && (!b || a > b));
}

function mergeResponses(local: CapabilityResponse[], remote: CapabilityResponse[]): CapabilityResponse[] {
  const map = new Map<string, CapabilityResponse>();
  for (const r of remote) map.set(`${r.teacherId.toLowerCase()}__${r.capabilityId}`, r);
  for (const r of local) {
    const key = `${r.teacherId.toLowerCase()}__${r.capabilityId}`;
    const rem = map.get(key);
    if (!rem || newerStamp(r.updatedAt, rem.updatedAt)) map.set(key, r);
  }
  return [...map.values()];
}

function contentFingerprint(d: Partial<AppData>): string {
  return JSON.stringify({
    periods: d.periods,
    tools: d.tools,
    capabilities: d.capabilities,
    lessons: d.lessons,
    meetings: d.meetings,
    badges: d.badges,
  });
}

type Store = {
  data: AppData;
  session: Session | null;
  firebaseOn: boolean;
  teacher: Teacher | undefined;
  isAdmin: boolean;
  isAuthedBeyondForm: boolean;
  syncReady: boolean;
  cloudSave: "idle" | "saving" | "saved" | "error";
  setData: (updater: AppData | ((prev: AppData) => AppData)) => void;
  enterForm: (institutionId: string, teacher: Teacher) => void;
  enterWithGoogle: () => Promise<{ ok: true } | { ok: false; error: string }>;
  linkGoogle: () => Promise<string | null>;
  logout: () => void;
  upsertResponse: (patch: Partial<CapabilityResponse> & { capabilityId: string }) => void;
  responseOf: (capabilityId: string, teacherId?: string) => CapabilityResponse;
  upsertRsvp: (patch: Partial<MeetingRsvp> & { meetingId: string }) => void;
  upsertReaction: (patch: Partial<Reaction> & { capabilityId: string }) => void;
  upsertPair: (pair: LearningPair) => void;
  myBadges: string[];
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setDataStateRaw] = useState<AppData>(() => normalizeContent(loadData()));
  const setDataState = (updater: AppData | ((prev: AppData) => AppData)) => {
    setDataStateRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return dropUnwantedContent(next);
    });
  };
  const [session, setSessionState] = useState<Session | null>(() => loadSession());
  const [syncReady, setSyncReady] = useState(!firebaseEnabled());
  const [cloudSave, setCloudSave] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const skipRemoteContent = useRef(false);
  const hydrated = useRef(!firebaseEnabled());
  const pending = useRef<AppData | null>(null);
  const saveTimer = useRef<number>(0);

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
          const localAt = local.settings?.contentUpdatedAt;
          const remoteAt = remote.settings?.contentUpdatedAt;
          const sess = loadSession();
          const adminHere = Boolean(
            sess &&
              (local.settings.adminEmails.includes(sess.email.toLowerCase()) ||
                local.teachers.find((t) => t.id === sess.teacherId)?.role === "admin"),
          );
          const keepLocalContent =
            newerStamp(localAt, remoteAt) ||
            (adminHere && !remoteAt && contentFingerprint(local) !== contentFingerprint(remote));
          const recovered = keepLocalContent
            ? normalizeContent({
                ...local,
                capabilities: unionCapabilities(local.capabilities ?? [], remote.capabilities ?? []),
                lessons: unionLessons(local.lessons ?? [], remote.lessons ?? []),
                settings: { ...local.settings, contentUpdatedAt: new Date().toISOString() },
              })
            : null;
          const remoteClean = normalizeContent({
            capabilities: unionCapabilities(local.capabilities ?? [], remote.capabilities ?? []),
            lessons: unionLessons(local.lessons ?? [], remote.lessons ?? []),
          });
          const stripped =
            JSON.stringify(remote.capabilities ?? []) !== JSON.stringify(remoteClean.capabilities) ||
            JSON.stringify(remote.lessons ?? []) !== JSON.stringify(remoteClean.lessons);
          setDataState((prev) => ({
            ...(recovered ?? prev),
            ...(keepLocalContent ? {} : remote),
            teachers: remote.teachers?.length ? remote.teachers : prev.teachers,
            badges: (keepLocalContent ? prev.badges : remote.badges ?? prev.badges).map(normalizeBadge),
            responses: mergeResponses(prev.responses, remote.responses ?? []),
            rsvps: remote.rsvps ?? prev.rsvps,
            reactions: remote.reactions ?? prev.reactions,
            pairs: remote.pairs ?? prev.pairs,
            capabilities: keepLocalContent ? recovered!.capabilities : remoteClean.capabilities,
            lessons: keepLocalContent ? recovered!.lessons : remoteClean.lessons,
          }));
          if (stripped && !recovered) {
            skipRemoteContent.current = true;
            void pushContent({
              ...local,
              ...remote,
              ...remoteClean,
              settings: { ...(remote.settings ?? local.settings), contentUpdatedAt: new Date().toISOString() },
            }).finally(() => {
              window.setTimeout(() => {
                skipRemoteContent.current = false;
              }, 400);
            });
          }
          if (recovered) {
            skipRemoteContent.current = true;
            void pushContent(recovered)
              .then(() => setCloudSave("saved"))
              .catch((err) => {
                console.error("pushContent", err);
                setCloudSave("error");
              })
              .finally(() => {
                window.setTimeout(() => {
                  skipRemoteContent.current = false;
                }, 400);
              });
          }
        }
        hydrated.current = true;
        stop = watchShared((part) => {
          if (skipRemoteContent.current && isContentPart(part) && !("responses" in part) && !("teachers" in part)) {
            return;
          }
          setDataState((prev) => {
            const incoming = skipRemoteContent.current && isContentPart(part) ? {} : part;
            const next = {
              ...prev,
              ...incoming,
              ...("responses" in part && part.responses
                ? { responses: mergeResponses(prev.responses, part.responses) }
                : {}),
            };
            if (incoming.lessons) {
              next.lessons = unionLessons(prev.lessons, incoming.lessons);
            }
            if (incoming.capabilities) {
              next.capabilities = unionCapabilities(prev.capabilities, incoming.capabilities);
            }
            return incoming.capabilities || incoming.lessons ? dropUnwantedContent(next) : next;
          });
        });
      } catch (err) {
        console.error("Firebase sync", err);
      } finally {
        hydrated.current = true;
        setSyncReady(true);
        const leftover = pending.current;
        if (leftover) {
          skipRemoteContent.current = true;
          setCloudSave("saving");
          void pushContent(leftover)
            .then(() => {
              setCloudSave("saved");
              window.setTimeout(() => {
                skipRemoteContent.current = false;
              }, 400);
            })
            .catch((err) => {
              console.error("pushContent", err);
              setCloudSave("error");
            });
        }
      }
    })();
    return () => stop();
  }, []);

  const setData: Store["setData"] = (updater) => {
    setDataState((prev) => {
      const stamped: AppData = typeof updater === "function" ? updater(prev) : updater;
      const next: AppData = {
        ...stamped,
        settings: { ...stamped.settings, contentUpdatedAt: new Date().toISOString() },
      };
      pending.current = next;
      if (firebaseEnabled() && hydrated.current) {
        skipRemoteContent.current = true;
        setCloudSave("saving");
        window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(() => {
          const payload = pending.current;
          if (!payload) return;
          void pushContent(payload)
            .then(() => {
              setCloudSave("saved");
              window.setTimeout(() => {
                skipRemoteContent.current = false;
              }, 400);
            })
            .catch((err) => {
              console.error("pushContent", err);
              setCloudSave("error");
            });
        }, 700);
        const changed = next.teachers.filter((t) => {
          const old = prev.teachers.find((x) => x.id === t.id);
          return !old || JSON.stringify(old) !== JSON.stringify(t);
        });
        for (const t of changed) void pushTeacher(t);
        const removed = prev.teachers.filter((t) => !next.teachers.some((x) => x.id === t.id));
        for (const t of removed) void deleteTeacher(t);
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

  const sessionFromGoogleEmail = (email: string, source: AppData): Session | null => {
    const match = source.teachers.find((t) => t.email.toLowerCase() === email);
    const admin = source.settings.adminEmails.includes(email);
    if (!match && !admin) return null;
    const t = match ?? {
      id: email,
      institutionId: source.institutions[0]?.id ?? "tzviama",
      firstName: email.split("@")[0] ?? "",
      lastName: "",
      email,
      role: "admin" as const,
    };
    return {
      institutionId: t.institutionId,
      teacherId: t.id,
      email: t.email,
      googleLinked: true,
    };
  };

  const applyGoogleEmail = (email: string): boolean => {
    const next = sessionFromGoogleEmail(email, data);
    if (!next) return false;
    setSessionState(next);
    saveSession(next);
    return true;
  };

  useEffect(() => {
    if (!firebaseEnabled()) return;
    void completeGoogleRedirect().then((email) => {
      if (!email) return;
      if (applyGoogleEmail(email)) location.hash = "#/checklist";
    });
    // once on mount — data comes from localStorage / first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enterWithGoogle: Store["enterWithGoogle"] = async () => {
    if (!firebaseEnabled()) return { ok: false, error: "Firebase עדיין לא מחובר." };
    const email = await signInWithGoogle();
    if (!email) return { ok: true };
    if (!applyGoogleEmail(email)) {
      return { ok: false, error: `החשבון ${email} לא נמצא בספר המורות.` };
    }
    return { ok: true };
  };

  const linkGoogle: Store["linkGoogle"] = async () => {
    if (!firebaseEnabled()) {
      if (!session) return null;
      const next = { ...session, googleLinked: true };
      setSessionState(next);
      saveSession(next);
      return session.email;
    }
    const email = await signInWithGoogle();
    if (!email) return null;
    if (applyGoogleEmail(email)) return email;
    if (session) {
      const next = { ...session, googleLinked: true };
      setSessionState(next);
      saveSession(next);
      return email;
    }
    return null;
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
        (r) => r.teacherId.toLowerCase() === teacherId.toLowerCase() && r.capabilityId === patch.capabilityId,
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
    const id = (teacherId ?? session?.teacherId ?? session?.email ?? "").toLowerCase();
    return (
      data.responses.find(
        (r) => r.teacherId.toLowerCase() === id && r.capabilityId === capabilityId,
      ) ?? emptyResponse(id, capabilityId)
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

  const upsertPair: Store["upsertPair"] = (pair) => {
    if (!session) return;
    const me = session.teacherId.toLowerCase();
    const involved = pair.learnerId.toLowerCase() === me || pair.mentorId.toLowerCase() === me;
    if (!isAdmin && !involved) return;
    setDataState((prev) => {
      const next: LearningPair = {
        ...pair,
        doneAt: pair.done ? pair.doneAt ?? new Date().toISOString() : undefined,
      };
      const i = prev.pairs.findIndex((p) => p.id === next.id);
      const pairs = [...prev.pairs];
      if (i >= 0) pairs[i] = next;
      else pairs.push(next);
      void pushPair(next);
      return { ...prev, pairs };
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
    cloudSave,
    setData,
    enterForm,
    enterWithGoogle,
    linkGoogle,
    logout,
    upsertResponse,
    responseOf,
    upsertRsvp,
    upsertReaction,
    upsertPair,
    myBadges,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore מחוץ ל־Provider");
  return ctx;
}
