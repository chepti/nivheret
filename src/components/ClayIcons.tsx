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

export function ItemThumb({
  image,
  size = 50,
  shape = "circle",
  alt = "",
}: {
  image: string;
  size?: number;
  shape?: "circle" | "soft";
  alt?: string;
}) {
  return (
    <span className={`item-thumb ${shape}`} style={{ width: size, height: size }}>
      <img src={image} alt={alt} />
    </span>
  );
}

export function ClayIcon({
  name,
  size = 28,
  bg = "#ffe56a",
  image,
  shape = "circle",
}: {
  name: Tool["icon"];
  size?: number;
  bg?: string;
  image?: string;
  shape?: "circle" | "soft";
}) {
  const box = size + 22;
  if (image) return <ItemThumb image={image} size={box} shape={shape} />;
  const Icon = MAP[name] ?? BookOpen;
  return (
    <span
      className="clay-icon"
      style={{
        width: box,
        height: box,
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
