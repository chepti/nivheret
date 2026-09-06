import { useMemo, useState, type ReactNode } from "react";
import { Award, BookOpen, CalendarDays, ChevronLeft, Plus, Settings, Trash2, Users } from "lucide-react";
import { useStore } from "../app/store";
import { GoogleGate } from "../components/GoogleGate";
import { ImagePaste } from "../components/ImagePaste";
import { METRIC_OPTIONS, normalizeBadge } from "../lib/badges";
import { newId } from "../lib/storage";
import type { BadgeDef, BadgeMetric, Capability, Lesson, Meeting, Teacher, Tool } from "../lib/types";

type Node =
  | { kind: "home" }
  | { kind: "period"; id: string }
  | { kind: "tool"; id: string; tab: "info" | "caps" | "lessons" }
  | { kind: "meetings" }
  | { kind: "teachers" }
  | { kind: "badges" }
  | { kind: "settings" };

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="cms-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Cms() {
  const { data, setData, isAdmin, session, syncReady, cloudSave } = useStore();
  const [node, setNode] = useState<Node>({ kind: "home" });
  const [q, setQ] = useState("");
  const [openPeriod, setOpenPeriod] = useState<string | null>("elul-tishrei");

  const tool = node.kind === "tool" ? data.tools.find((t) => t.id === node.id) : undefined;
  const period = node.kind === "period" ? data.periods.find((p) => p.id === node.id) : undefined;

  const teachers = useMemo(() => {
    const s = q.trim();
    const low = s.toLowerCase();
    const list = s
      ? data.teachers.filter((t) => {
          const full = `${t.firstName} ${t.lastName}`;
          return (
            t.firstName.startsWith(s) ||
            t.lastName.startsWith(s) ||
            full.startsWith(s) ||
            full.includes(s) ||
            t.email.toLowerCase().startsWith(low) ||
            t.email.toLowerCase().includes(low)
          );
        })
      : data.teachers;
    return list.slice().sort((a, b) => {
      const aNew = a.email.startsWith("new-");
      const bNew = b.email.startsWith("new-");
      if (aNew !== bNew) return aNew ? -1 : 1;
      return a.firstName.localeCompare(b.firstName, "he");
    });
  }, [data.teachers, q]);

  if (!isAdmin) {
    return (
      <GoogleGate>
        <div className="clay" style={{ padding: 20 }}><h2>עריכת תוכן — לאדמין בלבד</h2></div>
      </GoogleGate>
    );
  }

  return (
    <GoogleGate>
      <div className="cms-layout">
        <aside className="cms-tree clay">
          <strong>עץ התוכן</strong>
          <button className={`tree-item ${node.kind === "home" ? "on" : ""}`} onClick={() => setNode({ kind: "home" })}>
            <BookOpen size={16} /> למידה לפי תקופות
          </button>
          {data.periods.map((p) => {
            const tools = data.tools.filter((t) => t.periodId === p.id);
            const open = openPeriod === p.id;
            return (
              <div key={p.id}>
                <button
                  className={`tree-item nest ${node.kind === "period" && node.id === p.id ? "on" : ""}`}
                  onClick={() => {
                    setOpenPeriod(open ? null : p.id);
                    setNode({ kind: "period", id: p.id });
                  }}
                >
                  {p.name}
                  <span className="small muted">{tools.length}</span>
                </button>
                {open && tools.map((t) => (
                  <button
                    key={t.id}
                    className={`tree-item nest2 ${node.kind === "tool" && node.id === t.id ? "on" : ""}`}
                    onClick={() => setNode({ kind: "tool", id: t.id, tab: "caps" })}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            );
          })}
          <button className={`tree-item ${node.kind === "meetings" ? "on" : ""}`} onClick={() => setNode({ kind: "meetings" })}>
            <CalendarDays size={16} /> מפגשים
          </button>
          <button className={`tree-item ${node.kind === "teachers" ? "on" : ""}`} onClick={() => setNode({ kind: "teachers" })}>
            <Users size={16} /> מורות
          </button>
          <button className={`tree-item ${node.kind === "badges" ? "on" : ""}`} onClick={() => setNode({ kind: "badges" })}>
            <Award size={16} /> באדג׳ים
          </button>
          <button className={`tree-item ${node.kind === "settings" ? "on" : ""}`} onClick={() => setNode({ kind: "settings" })}>
            <Settings size={16} /> הגדרות
          </button>
        </aside>

        <div>
          <div className="cms-sticky clay">
            <div>
              <div className="small muted">עריכת תוכן</div>
              <h1 style={{ fontSize: "1.4rem", margin: 0 }}>{titleOf(node)}</h1>
              <div className="small" style={{ color: cloudSave === "error" ? "#c0392b" : "var(--mastered)", fontWeight: cloudSave === "error" ? 700 : 400 }}>
                {!syncReady ? "טוען את הענן…" : cloudSave === "saving" ? "שומר בענן…" : cloudSave === "saved" ? "נשמר בענן — אפשר לרענן" : cloudSave === "error" ? "השמירה לענן נכשלה — העריכה עדיין אצלך במכשיר" : "השינויים נשמרים אוטומטית לענן"}
              </div>
            </div>
            <div className="row">
              {node.kind === "period" && <button className="pill btn-yellow" onClick={() => addTool(node.id)}><Plus size={16} /> כלי לתקופה</button>}
              {node.kind === "tool" && node.tab === "caps" && <button className="pill btn-yellow" onClick={() => addCap(node.id)}><Plus size={16} /> יכולת</button>}
              {node.kind === "tool" && node.tab === "lessons" && <button className="pill btn-yellow" onClick={() => addLesson(node.id)}><Plus size={16} /> שיעור</button>}
              {node.kind === "meetings" && <button className="pill btn-yellow" onClick={addMeet}><Plus size={16} /> מפגש</button>}
              {node.kind === "teachers" && <button className="pill btn-yellow" onClick={addTeacher}><Plus size={16} /> מורה</button>}
              {node.kind === "badges" && <button className="pill btn-yellow" onClick={addBadge}><Plus size={16} /> באדג׳</button>}
            </div>
          </div>

          {node.kind === "home" && (
            <div className="cms-home">
              <p>בחרי תקופה בעץ, ואז כלי — משם עורכים יכולות ושיעורים. כל שינוי נשמר לענן; תראי «נשמר בענן» למעלה אחרי הקלדה.</p>
              <div className="grid-tools">
                {data.periods.map((p) => (
                  <button key={p.id} className="clay cms-card" onClick={() => { setOpenPeriod(p.id); setNode({ kind: "period", id: p.id }); }}>
                    <strong>{p.name}</strong>
                    <span className="small muted">{p.months}</span>
                    <ChevronLeft size={18} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {node.kind === "period" && period && (
            <div>
              <p className="small">{period.months}</p>
              {data.tools.filter((t) => t.periodId === period.id).map((t) => {
                const n = data.capabilities.filter((c) => c.toolId === t.id).length;
                return (
                  <button key={t.id} className="clay cms-card" onClick={() => setNode({ kind: "tool", id: t.id, tab: "caps" })}>
                    <strong>{t.name}</strong>
                    <span className="small muted">{t.subtitle || `${n} יכולות`}</span>
                  </button>
                );
              })}
            </div>
          )}

          {node.kind === "tool" && tool && (
            <div>
              <div className="cms-tabs">
                {(["info", "caps", "lessons"] as const).map((tab) => (
                  <button key={tab} className={node.tab === tab ? "on" : ""} onClick={() => setNode({ ...node, tab })}>
                    {tab === "info" ? "פרטי הכלי" : tab === "caps" ? "יכולות" : "שיעורים"}
                  </button>
                ))}
              </div>

              {node.tab === "info" && (
                <div className="clay cms-editor">
                  <Field label="שם הכלי">
                    <input className="field" value={tool.name} onChange={(e) => patchTool(tool.id, { name: e.target.value })} />
                  </Field>
                  <Field label="כותרת משנה">
                    <input className="field" value={tool.subtitle} onChange={(e) => patchTool(tool.id, { subtitle: e.target.value })} />
                  </Field>
                  <Field label="תיאור">
                    <textarea className="field" value={tool.description} onChange={(e) => patchTool(tool.id, { description: e.target.value })} />
                  </Field>
                  <Field label="תקופה">
                    <select className="field" value={tool.periodId} onChange={(e) => patchTool(tool.id, { periodId: e.target.value })}>
                      {data.periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </Field>
                </div>
              )}

              {node.tab === "caps" && data.capabilities.filter((c) => c.toolId === tool.id).map((c) => (
                <div key={c.id} className="clay cms-editor">
                  <Field label="שם היכולת">
                    <input className="field" value={c.title} onChange={(e) => patchCap(c.id, { title: e.target.value })} />
                  </Field>
                  <Field label="מה בודקים כאן">
                    <textarea className="field" value={c.description} onChange={(e) => patchCap(c.id, { description: e.target.value })} />
                  </Field>
                  <button className="small" onClick={() => setData((d) => ({ ...d, capabilities: d.capabilities.filter((x) => x.id !== c.id) }))}>מחיקת יכולת</button>
                </div>
              ))}

              {node.tab === "lessons" && data.lessons.filter((l) => data.capabilities.some((c) => c.id === l.capabilityId && c.toolId === tool.id)).map((l) => (
                <div key={l.id} className="clay cms-editor">
                  <Field label="שייך ליכולת">
                    <select className="field" value={l.capabilityId} onChange={(e) => patchLesson(l.id, { capabilityId: e.target.value })}>
                      {data.capabilities.filter((c) => c.toolId === tool.id).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </Field>
                  <Field label="כותרת השיעור">
                    <input className="field" value={l.title} onChange={(e) => patchLesson(l.id, { title: e.target.value })} />
                  </Field>
                  <Field label="תוכן">
                    <textarea className="field tall" value={l.body} onChange={(e) => patchLesson(l.id, { body: e.target.value })} />
                  </Field>
                  <Field label="קישור סרטון (embed)">
                    <input className="field" dir="ltr" value={l.videoUrl ?? ""} onChange={(e) => patchLesson(l.id, { videoUrl: e.target.value })} />
                  </Field>
                  {l.quiz.map((quiz, qi) => (
                    <div key={quiz.id}>
                      <Field label={`שאלת תרגול ${qi + 1}`}>
                        <input className="field" value={quiz.prompt} onChange={(e) => patchQuiz(l.id, qi, { prompt: e.target.value })} />
                      </Field>
                      {quiz.options.map((opt, oi) => (
                        <Field key={oi} label={oi === quiz.correctIndex ? `תשובה ${oi + 1} (נכונה)` : `תשובה ${oi + 1}`}>
                          <input className="field" value={opt} onChange={(e) => {
                            const options = [...quiz.options];
                            options[oi] = e.target.value;
                            patchQuiz(l.id, qi, { options });
                          }} />
                        </Field>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {node.kind === "meetings" && data.meetings.map((m) => (
            <div key={m.id} className="clay cms-editor">
              <Field label="כותרת"><input className="field" value={m.title} onChange={(e) => patchMeet(m.id, { title: e.target.value })} /></Field>
              <Field label="תחום"><input className="field" value={m.topic} onChange={(e) => patchMeet(m.id, { topic: e.target.value })} /></Field>
              <Field label="מועד"><input className="field" type="datetime-local" value={m.datetime.slice(0, 16)} onChange={(e) => patchMeet(m.id, { datetime: e.target.value })} /></Field>
              <Field label="מקום"><input className="field" value={m.location} onChange={(e) => patchMeet(m.id, { location: e.target.value })} /></Field>
              <Field label="תיאור"><textarea className="field" value={m.description} onChange={(e) => patchMeet(m.id, { description: e.target.value })} /></Field>
            </div>
          ))}

          {node.kind === "teachers" && (
            <div>
              <input className="field" placeholder="חיפוש — אותיות ראשונות של השם או המייל" value={q} onChange={(e) => setQ(e.target.value)} />
              <p className="small">{q ? `${teachers.length} תוצאות מתוך ${data.teachers.length}` : `${data.teachers.length} מורות בספר`}</p>
              <div className="clay teacher-list">
                <div className="teacher-row head">
                  <span>שם פרטי</span>
                  <span>משפחה</span>
                  <span>מייל</span>
                  <span>תפקיד</span>
                  <span />
                </div>
                {teachers.map((t) => (
                  <div key={t.id} className="teacher-row">
                    <input className="field slim" value={t.firstName} onChange={(e) => patchTeacher(t.id, { firstName: e.target.value })} />
                    <input className="field slim" value={t.lastName} onChange={(e) => patchTeacher(t.id, { lastName: e.target.value })} />
                    <input className="field slim" dir="ltr" value={t.email} onChange={(e) => patchTeacher(t.id, { email: e.target.value, id: e.target.value })} />
                    <select className="field slim" value={t.role} onChange={(e) => patchTeacher(t.id, { role: e.target.value as Teacher["role"] })}>
                      <option value="teacher">מורה</option>
                      <option value="leadership">הנהלה</option>
                      <option value="admin">אדמין</option>
                    </select>
                    <button
                      className="teacher-del"
                      title="הסרת מורה"
                      onClick={() => removeTeacher(t)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button className="cms-fab" onClick={addTeacher}>
                <Plus size={20} />
                מורה
              </button>
            </div>
          )}

          {node.kind === "badges" && data.badges.map((raw) => {
            const b = normalizeBadge(raw);
            return (
              <div key={b.id} className="clay cms-editor">
                <Field label="שם הבאדג׳">
                  <input className="field" value={b.title} onChange={(e) => patchBadge(b.id, { title: e.target.value })} />
                </Field>
                <Field label="מה סופרים">
                  <select className="field" value={b.metric} onChange={(e) => {
                    const metric = e.target.value as BadgeMetric;
                    const tpl = METRIC_OPTIONS.find((m) => m.id === metric)?.template ?? b.description;
                    patchBadge(b.id, { metric, description: tpl });
                  }}>
                    {METRIC_OPTIONS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </Field>
                <Field label="יעד (המספר שממנו מקבלים את הבאדג׳)">
                  <input className="field" type="number" min={1} value={b.target} onChange={(e) => patchBadge(b.id, { target: Math.max(1, Number(e.target.value) || 1) })} />
                </Field>
                <Field label="משפט בפרופיל — אפשר {current} ו־{target}">
                  <input className="field" value={b.description} onChange={(e) => patchBadge(b.id, { description: e.target.value })} />
                </Field>
                <Field label="תמונת דמות">
                  <ImagePaste
                    value={b.image}
                    maxEdge={280}
                    hint="הדביקי או העלי תמונת דמות לבאדג׳"
                    onChange={(image) => patchBadge(b.id, { image })}
                  />
                </Field>
                <button className="small" onClick={() => setData((d) => ({ ...d, badges: d.badges.filter((x) => x.id !== b.id) }))}>מחיקת באדג׳</button>
              </div>
            );
          })}

          {node.kind === "settings" && (
            <div className="clay cms-editor">
              <Field label="מיילי אדמין (שורה לכל מייל)">
                <textarea className="field" dir="ltr" value={data.settings.adminEmails.join("\n")} onChange={(e) => setData((d) => ({ ...d, settings: { ...d.settings, adminEmails: e.target.value.split(/\s+/).filter(Boolean) } }))} />
              </Field>
              <Field label="הודעת פרגון שבועית">
                <textarea className="field tall" value={data.settings.praiseNote} onChange={(e) => setData((d) => ({ ...d, settings: { ...d.settings, praiseNote: e.target.value } }))} />
              </Field>
            </div>
          )}
        </div>
      </div>
    </GoogleGate>
  );

  function titleOf(n: Node): string {
    if (n.kind === "home") return "בחרי איפה לערוך";
    if (n.kind === "period") return data.periods.find((p) => p.id === n.id)?.name ?? "";
    if (n.kind === "tool") return data.tools.find((t) => t.id === n.id)?.name ?? "";
    if (n.kind === "meetings") return "מפגשי צוות";
    if (n.kind === "teachers") return "ספר מורות";
    if (n.kind === "badges") return "באדג׳ים";
    return "הגדרות";
  }
  function patchTool(id: string, patch: Partial<Tool>) {
    setData((d) => ({ ...d, tools: d.tools.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }
  function patchCap(id: string, patch: Partial<Capability>) {
    setData((d) => ({ ...d, capabilities: d.capabilities.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  }
  function patchLesson(id: string, patch: Partial<Lesson>) {
    setData((d) => ({ ...d, lessons: d.lessons.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  }
  function patchQuiz(lessonId: string, qi: number, patch: Partial<Lesson["quiz"][number]>) {
    setData((d) => ({
      ...d,
      lessons: d.lessons.map((l) => l.id !== lessonId ? l : { ...l, quiz: l.quiz.map((quiz, i) => (i === qi ? { ...quiz, ...patch } : quiz)) }),
    }));
  }
  function patchMeet(id: string, patch: Partial<Meeting>) {
    setData((d) => ({ ...d, meetings: d.meetings.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
  }
  function patchTeacher(id: string, patch: Partial<Teacher>) {
    setData((d) => ({ ...d, teachers: d.teachers.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }
  function addTool(periodId: string) {
    const id = newId("tool");
    setData((d) => ({
      ...d,
      tools: [...d.tools, { id, periodId, name: "כלי חדש", subtitle: "", icon: "sites", color: "#f5c518", description: "", order: d.tools.length + 1 }],
    }));
    setNode({ kind: "tool", id, tab: "info" });
  }
  function addCap(toolId: string) {
    setData((d) => ({
      ...d,
      capabilities: [...d.capabilities, { id: newId("cap"), toolId, title: "יכולת חדשה", description: "", order: d.capabilities.length + 1 }],
    }));
  }
  function addLesson(toolId: string) {
    const cap = data.capabilities.find((c) => c.toolId === toolId);
    setData((d) => ({
      ...d,
      lessons: [...d.lessons, {
        id: newId("lesson"),
        capabilityId: cap?.id ?? "",
        title: "שיעור חדש",
        body: "",
        quiz: [{ id: newId("q"), prompt: "שאלה", options: ["א", "ב", "ג"], correctIndex: 0 }],
        autoCompleteOnQuiz: true,
      }],
    }));
  }
  function addMeet() {
    setData((d) => ({
      ...d,
      meetings: [...d.meetings, { id: newId("meet"), title: "מפגש חדש", topic: "צוות", datetime: new Date().toISOString().slice(0, 16), location: "", description: "" }],
    }));
  }
  function patchBadge(id: string, patch: Partial<BadgeDef>) {
    setData((d) => ({ ...d, badges: d.badges.map((b) => (b.id === id ? normalizeBadge({ ...b, ...patch }) : b)) }));
  }
  function addBadge() {
    setData((d) => ({
      ...d,
      badges: [...d.badges, {
        id: newId("badge"),
        title: "באדג׳ חדש",
        description: "סימנת {current} מתוך {target} תחומים",
        icon: "award",
        metric: "wantToLearn",
        target: 5,
      }],
    }));
  }
  function removeTeacher(t: Teacher) {
    if (session?.teacherId === t.id || session?.email.toLowerCase() === t.email.toLowerCase()) {
      window.alert("אי אפשר להסיר את החשבון שאיתו נכנסת.");
      return;
    }
    if (!window.confirm(`להסיר את ${t.firstName} ${t.lastName} מספר המורות?`)) return;
    setData((d) => ({ ...d, teachers: d.teachers.filter((x) => x.id !== t.id) }));
  }
  function addTeacher() {
    const email = `new-${Date.now()}@tzviama.com`;
    setQ("");
    setData((d) => ({
      ...d,
      teachers: [{ id: email, institutionId: "tzviama", firstName: "מורה", lastName: "חדשה", email, role: "teacher" }, ...d.teachers],
    }));
  }
}
