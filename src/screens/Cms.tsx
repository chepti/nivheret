import { useState } from "react";
import { useStore } from "../app/store";
import { GoogleGate } from "../components/GoogleGate";
import { newId } from "../lib/storage";
import type { Capability, Lesson, Meeting, Teacher, Tool } from "../lib/types";

const TABS = ["כלים", "יכולות", "שיעורים", "מפגשים", "מורות", "הגדרות"] as const;
type Tab = (typeof TABS)[number];

export function Cms() {
  const { data, setData, isAdmin } = useStore();
  const [tab, setTab] = useState<Tab>("כלים");

  if (!isAdmin) {
    return (
      <GoogleGate>
        <div className="clay" style={{ padding: 20 }}><h2>עריכת תוכן — לאדמין בלבד</h2></div>
      </GoogleGate>
    );
  }

  return (
    <GoogleGate>
      <h1>CMS</h1>
      <p>עורכים כאן את השאלות, הכלים והתוכן הלימודי — בלי לגעת בקוד.</p>
      <div className="cms-tabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "כלים" && (
        <div>
          {data.tools.map((tool) => (
            <div key={tool.id} className="clay" style={{ padding: 14, margin: "10px 0" }}>
              <input className="field" value={tool.name} onChange={(e) => patchTool(tool.id, { name: e.target.value })} />
              <input className="field" style={{ marginTop: 8 }} value={tool.subtitle} onChange={(e) => patchTool(tool.id, { subtitle: e.target.value })} />
              <textarea className="field" style={{ marginTop: 8, minHeight: 60 }} value={tool.description} onChange={(e) => patchTool(tool.id, { description: e.target.value })} />
              <select className="field" style={{ marginTop: 8 }} value={tool.periodId} onChange={(e) => patchTool(tool.id, { periodId: e.target.value })}>
                {data.periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          ))}
          <button className="pill btn-yellow" onClick={addTool}>כלי חדש</button>
        </div>
      )}

      {tab === "יכולות" && (
        <div>
          {data.capabilities.map((c) => (
            <div key={c.id} className="clay" style={{ padding: 14, margin: "10px 0" }}>
              <select className="field" value={c.toolId} onChange={(e) => patchCap(c.id, { toolId: e.target.value })}>
                {data.tools.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input className="field" style={{ marginTop: 8 }} value={c.title} onChange={(e) => patchCap(c.id, { title: e.target.value })} />
              <textarea className="field" style={{ marginTop: 8, minHeight: 60 }} value={c.description} onChange={(e) => patchCap(c.id, { description: e.target.value })} />
              <button className="small" style={{ color: "var(--teach)" }} onClick={() => setData((d) => ({ ...d, capabilities: d.capabilities.filter((x) => x.id !== c.id) }))}>מחיקה</button>
            </div>
          ))}
          <button className="pill btn-yellow" onClick={addCap}>יכולת חדשה</button>
        </div>
      )}

      {tab === "שיעורים" && (
        <div>
          {data.lessons.map((l) => (
            <div key={l.id} className="clay" style={{ padding: 14, margin: "10px 0" }}>
              <select className="field" value={l.capabilityId} onChange={(e) => patchLesson(l.id, { capabilityId: e.target.value })}>
                {data.capabilities.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <input className="field" style={{ marginTop: 8 }} value={l.title} onChange={(e) => patchLesson(l.id, { title: e.target.value })} />
              <textarea className="field" style={{ marginTop: 8, minHeight: 80 }} value={l.body} onChange={(e) => patchLesson(l.id, { body: e.target.value })} />
              <input className="field" style={{ marginTop: 8 }} dir="ltr" placeholder="קישור סרטון embed" value={l.videoUrl ?? ""} onChange={(e) => patchLesson(l.id, { videoUrl: e.target.value })} />
              {l.quiz.map((q, qi) => (
                <div key={q.id} style={{ marginTop: 10 }}>
                  <input className="field" value={q.prompt} onChange={(e) => patchQuiz(l.id, qi, { prompt: e.target.value })} />
                  {q.options.map((opt, oi) => (
                    <input key={oi} className="field" style={{ marginTop: 6 }} value={opt} onChange={(e) => {
                      const options = [...q.options];
                      options[oi] = e.target.value;
                      patchQuiz(l.id, qi, { options });
                    }} />
                  ))}
                </div>
              ))}
            </div>
          ))}
          <button className="pill btn-yellow" onClick={addLesson}>שיעור חדש</button>
        </div>
      )}

      {tab === "מפגשים" && (
        <div>
          {data.meetings.map((m) => (
            <div key={m.id} className="clay" style={{ padding: 14, margin: "10px 0" }}>
              <input className="field" value={m.title} onChange={(e) => patchMeet(m.id, { title: e.target.value })} />
              <input className="field" style={{ marginTop: 8 }} value={m.topic} onChange={(e) => patchMeet(m.id, { topic: e.target.value })} />
              <input className="field" style={{ marginTop: 8 }} type="datetime-local" value={m.datetime.slice(0, 16)} onChange={(e) => patchMeet(m.id, { datetime: e.target.value })} />
              <input className="field" style={{ marginTop: 8 }} value={m.location} onChange={(e) => patchMeet(m.id, { location: e.target.value })} />
              <textarea className="field" style={{ marginTop: 8, minHeight: 70 }} value={m.description} onChange={(e) => patchMeet(m.id, { description: e.target.value })} />
            </div>
          ))}
          <button className="pill btn-yellow" onClick={addMeet}>מפגש חדש</button>
        </div>
      )}

      {tab === "מורות" && (
        <div>
          <p className="small">{data.teachers.length} מורות. אפשר להוסיף או לשנות תפקיד.</p>
          {data.teachers.map((t) => (
            <div key={t.id} className="row clay" style={{ padding: 10, margin: "6px 0" }}>
              <input className="field grow" value={`${t.firstName} ${t.lastName}`} onChange={(e) => {
                const [firstName, ...rest] = e.target.value.split(" ");
                patchTeacher(t.id, { firstName, lastName: rest.join(" ") });
              }} />
              <input className="field" dir="ltr" style={{ maxWidth: 240 }} value={t.email} onChange={(e) => patchTeacher(t.id, { email: e.target.value, id: e.target.value })} />
              <select className="field" style={{ maxWidth: 120 }} value={t.role} onChange={(e) => patchTeacher(t.id, { role: e.target.value as Teacher["role"] })}>
                <option value="teacher">מורה</option>
                <option value="leadership">הנהלה</option>
                <option value="admin">אדמין</option>
              </select>
            </div>
          ))}
          <button className="pill btn-yellow" onClick={addTeacher}>מורה חדשה</button>
        </div>
      )}

      {tab === "הגדרות" && (
        <div className="clay" style={{ padding: 16 }}>
          <label className="small">מיילי אדמין (שורה לכל מייל)</label>
          <textarea
            className="field"
            style={{ minHeight: 80, marginTop: 8 }}
            dir="ltr"
            value={data.settings.adminEmails.join("\n")}
            onChange={(e) => setData((d) => ({ ...d, settings: { ...d.settings, adminEmails: e.target.value.split(/\s+/).filter(Boolean) } }))}
          />
          <label className="small">הודעת פרגון שבועית</label>
          <textarea
            className="field"
            style={{ minHeight: 80, marginTop: 8 }}
            value={data.settings.praiseNote}
            onChange={(e) => setData((d) => ({ ...d, settings: { ...d.settings, praiseNote: e.target.value } }))}
          />
        </div>
      )}
    </GoogleGate>
  );

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
      lessons: d.lessons.map((l) => {
        if (l.id !== lessonId) return l;
        const quiz = l.quiz.map((q, i) => (i === qi ? { ...q, ...patch } : q));
        return { ...l, quiz };
      }),
    }));
  }
  function patchMeet(id: string, patch: Partial<Meeting>) {
    setData((d) => ({ ...d, meetings: d.meetings.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
  }
  function patchTeacher(id: string, patch: Partial<Teacher>) {
    setData((d) => ({ ...d, teachers: d.teachers.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }
  function addTool() {
    setData((d) => ({
      ...d,
      tools: [...d.tools, {
        id: newId("tool"),
        periodId: d.periods[0]?.id ?? "elul-tishrei",
        name: "כלי חדש",
        subtitle: "",
        icon: "sites",
        color: "#f5c518",
        description: "",
        order: d.tools.length + 1,
      }],
    }));
  }
  function addCap() {
    setData((d) => ({
      ...d,
      capabilities: [...d.capabilities, {
        id: newId("cap"),
        toolId: d.tools[0]?.id ?? "classroom",
        title: "יכולת חדשה",
        description: "",
        order: d.capabilities.length + 1,
      }],
    }));
  }
  function addLesson() {
    setData((d) => ({
      ...d,
      lessons: [...d.lessons, {
        id: newId("lesson"),
        capabilityId: d.capabilities[0]?.id ?? "",
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
      meetings: [...d.meetings, {
        id: newId("meet"),
        title: "מפגש חדש",
        topic: "צוות",
        datetime: new Date().toISOString().slice(0, 16),
        location: "",
        description: "",
      }],
    }));
  }
  function addTeacher() {
    const email = `new-${Date.now()}@tzviama.com`;
    setData((d) => ({
      ...d,
      teachers: [...d.teachers, {
        id: email,
        institutionId: "tzviama",
        firstName: "מורה",
        lastName: "חדשה",
        email,
        role: "teacher",
      }],
    }));
  }
}
