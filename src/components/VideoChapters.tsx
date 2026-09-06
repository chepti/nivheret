import { ListVideo } from "lucide-react";
import { secToStamp } from "../lib/html";
import type { VideoChapter } from "../lib/types";

export function VideoChapters({
  chapters,
  active,
  onPick,
}: {
  chapters: VideoChapter[];
  active?: number;
  onPick: (t: number) => void;
}) {
  if (!chapters.length) return null;
  return (
    <nav className="chapter-list clay" aria-label="פרקי הסרטון">
      <h2><ListVideo size={18} /> פרקים בסרטון</h2>
      <ol>
        {chapters.map((c) => (
          <li key={`${c.t}-${c.label}`}>
            <button
              type="button"
              className={active === c.t ? "on" : ""}
              onClick={() => onPick(c.t)}
            >
              <span className="chapter-time" dir="ltr">{secToStamp(c.t)}</span>
              <span>{c.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
