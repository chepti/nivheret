import { useEffect, useState } from "react";
import { useStore } from "../app/store";

function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function TeachingPicker({ embedded }: { embedded?: boolean }) {
  const { data, teacher, saveMyTeaching } = useStore();
  const classrooms = (data.classrooms ?? []).slice().sort((a, b) => a.order - b.order);
  const subjects = (data.subjects ?? []).slice().sort((a, b) => a.order - b.order);
  const [classIds, setClassIds] = useState<string[]>(teacher?.classIds ?? []);
  const [subjectIds, setSubjectIds] = useState<string[]>(teacher?.subjectIds ?? []);
  const incomplete =
    (classrooms.length > 0 && classIds.length === 0) ||
    (subjects.length > 0 && subjectIds.length === 0);
  const [open, setOpen] = useState(incomplete || Boolean(embedded));

  useEffect(() => {
    setClassIds(teacher?.classIds ?? []);
    setSubjectIds(teacher?.subjectIds ?? []);
  }, [teacher?.classIds, teacher?.subjectIds]);

  if (!classrooms.length && !subjects.length) return null;

  const classNames = classrooms.filter((c) => classIds.includes(c.id)).map((c) => c.name);
  const subjectNames = subjects.filter((s) => subjectIds.includes(s.id)).map((s) => s.name);
  const summary = [...classNames, ...subjectNames].join(" · ") || "עוד לא סומן";

  const persist = (nextClasses: string[], nextSubjects: string[]) => {
    setClassIds(nextClasses);
    setSubjectIds(nextSubjects);
    saveMyTeaching(nextClasses, nextSubjects);
  };

  return (
    <section className={`clay teach-box ${incomplete ? "need" : ""}`}>
      <button className="teach-toggle" onClick={() => setOpen((v) => !v)} type="button">
        <span>
          <strong>איפה מלמדים?</strong>
          <span className="small muted"> {open ? "סגירה" : summary}</span>
        </span>
      </button>
      {open && (
        <div className="teach-body">
          <p className="small">סימון קצר בהתחלה — אחר כך אפשר לראות בדשבורד פיזור לפי כיתות וצוותי תחום.</p>
          {!!classrooms.length && (
            <div>
              <div className="small" style={{ fontWeight: 700, marginBottom: 6 }}>כיתות</div>
              <div className="chip-wrap">
                {classrooms.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`pill small ${classIds.includes(c.id) ? "btn-yellow" : "btn-primary"}`}
                    onClick={() => persist(toggleId(classIds, c.id), subjectIds)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {!!subjects.length && (
            <div style={{ marginTop: classrooms.length ? 10 : 0 }}>
              <div className="small" style={{ fontWeight: 700, marginBottom: 6 }}>תחומי דעת</div>
              <div className="chip-wrap">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`pill small ${subjectIds.includes(s.id) ? "btn-yellow" : "btn-primary"}`}
                    onClick={() => persist(classIds, toggleId(subjectIds, s.id))}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
