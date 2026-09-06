import { BookOpen, GraduationCap, Star, Check } from "lucide-react";
import { useStore } from "../app/store";
import { STATUS_META, type StatusKey } from "../lib/status";
import type { CapabilityResponse } from "../lib/types";

function IconFor({ st }: { st: StatusKey }) {
  if (st === "teach") return <GraduationCap size={14} />;
  if (st === "product") return <Star size={14} />;
  if (st === "mastered") return <Check size={14} />;
  if (st === "want") return <BookOpen size={14} />;
  return null;
}

function cellStatus(rows: CapabilityResponse[]): StatusKey {
  if (!rows.length) return "empty";
  if (rows.some((r) => r.readyToTeach)) return "teach";
  if (rows.some((r) => r.hasProduct)) return "product";
  if (rows.some((r) => r.mastered)) return "mastered";
  if (rows.some((r) => r.wantToLearn)) return "want";
  return "empty";
}

export function HeatMap() {
  const { data } = useStore();
  const tools = data.tools.filter((t) => data.capabilities.some((c) => c.toolId === t.id));
  const teachers = data.teachers.filter((t) =>
    data.responses.some((r) => r.teacherId === t.id && (r.wantToLearn || r.mastered || r.hasProduct || r.readyToTeach)),
  );

  if (!teachers.length) return <p>מפת החום תתמלא כשמורות יסמנו יכולות.</p>;

  return (
    <div className="heat-wrap">
      <table className="heat-table">
        <thead>
          <tr>
            <th />
            {tools.map((t) => <th key={t.id}>{t.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id}>
              <th className="teacher-name">{teacher.firstName} {teacher.lastName}</th>
              {tools.map((tool) => {
                const caps = data.capabilities.filter((c) => c.toolId === tool.id);
                const rows = data.responses.filter((r) => r.teacherId === teacher.id && caps.some((c) => c.id === r.capabilityId));
                const st = cellStatus(rows);
                return (
                  <td key={tool.id}>
                    <div className="heat-cell" style={{ background: STATUS_META[st].color }} title={`${teacher.firstName} · ${tool.name} · ${STATUS_META[st].label}`}>
                      <IconFor st={st} />
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
