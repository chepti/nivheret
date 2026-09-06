import {
  BookOpen,
  Brain,
  ClipboardList,
  Folder,
  Video,
  Layout,
} from "lucide-react";
import type { Tool } from "../lib/types";

const MAP = {
  classroom: BookOpen,
  gemini: Brain,
  forms: ClipboardList,
  drive: Folder,
  meet: Video,
  sites: Layout,
};

export function ClayIcon({
  name,
  size = 28,
  bg = "#ffe56a",
}: {
  name: Tool["icon"];
  size?: number;
  bg?: string;
}) {
  const Icon = MAP[name] ?? BookOpen;
  return (
    <span
      className="clay-icon"
      style={{
        width: size + 22,
        height: size + 22,
        borderRadius: "38%",
        background: bg,
        display: "grid",
        placeItems: "center",
        boxShadow: "0 8px 18px rgba(70,50,10,0.14)",
        color: "#2a2430",
      }}
    >
      <Icon size={size} strokeWidth={2} />
    </span>
  );
}
