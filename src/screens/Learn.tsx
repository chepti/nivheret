import { useEffect, useMemo, useState } from "react";
import { Bookmark, Check, ChevronLeft, ChevronRight, Heart, PartyPopper } from "lucide-react";
import { navigate, type Route } from "../app/router";
import { useStore } from "../app/store";
import { ClayIcon, ItemThumb } from "../components/ClayIcons";
import { GoogleGate } from "../components/GoogleGate";
import { ImagePaste } from "../components/ImagePaste";
import { VideoChapters } from "../components/VideoChapters";
import { embedWithStart, lessonHtml } from "../lib/html";
import type { AppData, Lesson } from "../lib/types";

function learningPath(data: AppData): { lesson: Lesson; toolId: string; toolName: string }[] {
  const path: { lesson: Lesson; toolId: string; toolName: string }[] = [];
  for (const tool of data.tools.slice().sort((a, b) => a.order - b.order)) {
    const caps = data.capabilities.filter((c) => c.toolId === tool.id).slice().sort((a, b) => a.order - b.order);
    const capOrder = new Map(caps.map((c, i) => [c.id, i]));
    const lessons = data.lessons
      .filter((l) => capOrder.has(l.capabilityId))
      .sort((a, b) => (capOrder.get(a.capabilityId) ?? 0) - (capOrder.get(b.capabilityId) ?? 0));
    for (const lesson of lessons) path.push({ lesson, toolId: tool.id, toolName: tool.name });
  }
  return path;
}

function ChapterPager({
  prev,
  next,
  onPrev,
  onNext,
}: {
  prev?: string;
  next?: string;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  if (!prev && !next) return null;
  return (
    <nav className="chapter-pager" aria-label="מעבר בין פרקים">
      {prev && onPrev ? (
        <button type="button" className="pill btn-primary" onClick={onPrev}>
          <ChevronRight size={18} />
          <span>הפרק הקודם<span className="small muted"> {prev}</span></span>
        </button>
      ) : <span />}
      {next && onNext ? (
        <button type="button" className="pill btn-yellow chapter-next" onClick={onNext}>
          <span>הפרק הבא<span className="small muted"> {next}</span></span>
          <ChevronLeft size={18} />
        </button>
      ) : <span />}
    </nav>
  );
}

export function Learn({ route }: { route: Route }) {
  const { data, responseOf, upsertResponse, upsertReaction, session } = useStore();
  const [quizOk, setQuizOk] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [celebrate, setCelebrate] = useState(false);
  const [videoStart, setVideoStart] = useState(0);
  const path = useMemo(() => learningPath(data), [data]);
  useEffect(() => {
    setVideoStart(0);
  }, [route.id]);

  if (!session) return null;

  const lesson = route.name === "lesson" ? data.lessons.find((l) => l.id === route.id) : null;
  const reaction = lesson
    ? data.reactions.find((r) => r.teacherId === session.teacherId && r.capabilityId === lesson.capabilityId)
    : undefined;

  if (lesson) {
    const cap = data.capabilities.find((c) => c.id === lesson.capabilityId);
    const resp = responseOf(lesson.capabilityId);
    const here = path.findIndex((row) => row.lesson.id === lesson.id);
    const prevLesson = here > 0 ? path[here - 1] : undefined;
    const nextLesson = here >= 0 && here < path.length - 1 ? path[here + 1] : undefined;
    const checkQuiz = () => {
      const ok = lesson.quiz.every((q) => answers[q.id] === q.correctIndex);
      setQuizOk((p) => ({ ...p, [lesson.id]: ok }));
      if (ok && lesson.autoCompleteOnQuiz) {
        upsertResponse({ capabilityId: lesson.capabilityId, completedLearning: true });
        setCelebrate(true);
        window.setTimeout(() => setCelebrate(false), 1600);
      }
    };
    return (
      <GoogleGate>
        <button className="small muted" onClick={() => navigate("learn")}>חזרה ללמידה</button>
        {resp.completedLearning && (
          <div className="lesson-done-banner"><Check size={18} /> הפרק הושלם</div>
        )}
        <div className="lesson-hero">
          {(cap?.image || data.tools.find((t) => t.id === cap?.toolId)?.image) && (
            <ItemThumb
              image={cap?.image || data.tools.find((t) => t.id === cap?.toolId)?.image || ""}
              size={148}
              shape="free"
              alt=""
            />
          )}
          <div className="tool-head-text">
            <h1>{lesson.title}</h1>
            <p>{cap?.title}</p>
          </div>
        </div>
        {lesson.videoUrl && (
          <div className="clay" style={{ overflow: "hidden", aspectRatio: "16/9", margin: "12px 0" }}>
            <iframe
              key={`${lesson.id}-${videoStart}`}
              title={lesson.title}
              src={embedWithStart(lesson.videoUrl, videoStart)}
              style={{ width: "100%", height: "100%", border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        {!!lesson.chapters?.length && (
          <VideoChapters
            chapters={lesson.chapters}
            active={videoStart}
            onPick={(t) => setVideoStart(t)}
          />
        )}
        <div className="clay lesson-html" style={{ padding: 18 }} dangerouslySetInnerHTML={{ __html: lessonHtml(lesson.body) }} />
        {lesson.quiz.map((q) => (
          <div key={q.id} className="clay" style={{ padding: 16, marginTop: 12 }}>
            <strong>{q.prompt}</strong>
            {q.options.map((opt, i) => (
              <label key={opt} className="check-row">
                <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswers((p) => ({ ...p, [q.id]: i }))} />
                {opt}
              </label>
            ))}
          </div>
        ))}
        <div className="row" style={{ marginTop: 14 }}>
          <button className="pill btn-ink" onClick={checkQuiz}>בדקו אותי</button>
          <button className="pill btn-primary" onClick={() => upsertResponse({ capabilityId: lesson.capabilityId, savedForLater: !resp.savedForLater })}>
            <Bookmark size={16} /> {resp.savedForLater ? "שמור להמשך ✓" : "שמור ללמידה בהמשך"}
          </button>
        </div>
        {quizOk[lesson.id] === true && <p style={{ color: "var(--mastered)" }}>כל הכבוד — השיעור הושלם.</p>}
        {quizOk[lesson.id] === false && (
          <div>
            <p>עוד לא מדויק. אפשר לנסות שוב או לסמן השלמה ידנית.</p>
            <button className="pill btn-yellow" onClick={() => upsertResponse({ capabilityId: lesson.capabilityId, completedLearning: true })}>סמנו השלמה</button>
          </div>
        )}
        {celebrate && <div className="toast-save dopamine"><PartyPopper size={16} /> כל הכבוד!</div>}
        <div className="clay" style={{ padding: 16, marginTop: 16 }}>
          <h2>איך היה?</h2>
          <button className={`pill ${reaction?.liked ? "btn-yellow" : "btn-primary"}`} onClick={() => upsertReaction({ capabilityId: lesson.capabilityId, liked: !reaction?.liked })}>
            <Heart size={16} /> אהבתי
          </button>
          <textarea
            className="field"
            style={{ marginTop: 12, minHeight: 80 }}
            placeholder="הנה התוצר שלי — אפשר גם לכתוב כאן"
            value={reaction?.productNote ?? ""}
            onChange={(e) => upsertReaction({ capabilityId: lesson.capabilityId, productNote: e.target.value })}
            onPaste={(e) => {
              const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"));
              const file = item?.getAsFile();
              if (!file) return;
              e.preventDefault();
              const reader = new FileReader();
              reader.onload = () => upsertReaction({ capabilityId: lesson.capabilityId, productImage: String(reader.result) });
              reader.readAsDataURL(file);
            }}
          />
          <ImagePaste
            value={reaction?.productImage}
            maxEdge={640}
            forceJpeg
            onChange={(dataUrl) => upsertReaction({ capabilityId: lesson.capabilityId, productImage: dataUrl })}
          />
        </div>
        <ChapterPager
          prev={prevLesson?.lesson.title}
          next={nextLesson?.lesson.title}
          onPrev={prevLesson ? () => navigate("lesson", prevLesson.lesson.id) : undefined}
          onNext={nextLesson ? () => navigate("lesson", nextLesson.lesson.id) : undefined}
        />
      </GoogleGate>
    );
  }

  return (
    <GoogleGate>
      <h1>איזור הלמידה</h1>
      <p>כלים עם שיעורים מוכנים נפתחים כאן. השאר יתמלאו במהלך השנה.</p>
      {data.tools.slice().sort((a, b) => a.order - b.order).map((tool) => {
        const caps = data.capabilities.filter((c) => c.toolId === tool.id).slice().sort((a, b) => a.order - b.order);
        const capOrder = new Map(caps.map((c, i) => [c.id, i]));
        const lessons = data.lessons
          .filter((l) => capOrder.has(l.capabilityId))
          .sort((a, b) => (capOrder.get(a.capabilityId) ?? 0) - (capOrder.get(b.capabilityId) ?? 0));
        const chapters = path.reduce<{ id: string; name: string }[]>((acc, row) => {
          if (!acc.some((t) => t.id === row.toolId)) acc.push({ id: row.toolId, name: row.toolName });
          return acc;
        }, []);
        const chapterAt = chapters.findIndex((t) => t.id === tool.id);
        const prevChapter = chapterAt > 0 ? chapters[chapterAt - 1] : undefined;
        const nextChapter = chapterAt >= 0 && chapterAt < chapters.length - 1 ? chapters[chapterAt + 1] : undefined;
        return (
          <article key={tool.id} id={`learn-${tool.id}`} className="clay tool-block">
            <div className="tool-head">
              {tool.image ? <ItemThumb image={tool.image} size={128} shape="free" /> : <ClayIcon name={tool.icon} bg={tool.color} />}
              <div className="tool-head-text">
                <h2>{tool.name}</h2>
                <p className="small">{lessons.length ? `${lessons.length} שיעורים מוכנים` : "עוד אין שיעורים"}</p>
              </div>
            </div>
            {lessons.map((l) => {
              const r = responseOf(l.capabilityId);
              const lessonCap = caps.find((c) => c.id === l.capabilityId);
              return (
                <button key={l.id} className={`clay cap-card cap-line ${r.completedLearning ? "lesson-done" : ""}`} onClick={() => navigate("lesson", l.id)}>
                  {lessonCap?.image && <ItemThumb image={lessonCap.image} size={56} shape="free" />}
                  <span className="cap-line-text">
                    <strong>{l.title}</strong>
                    {r.completedLearning ? (
                      <span className="done-badge"><Check size={15} /> הושלם</span>
                    ) : (
                      <span className="small muted">{r.savedForLater ? "שמור להמשך" : "פתחי שיעור"}</span>
                    )}
                  </span>
                </button>
              );
            })}
            {!!lessons.length && (
              <ChapterPager
                prev={prevChapter?.name}
                next={nextChapter?.name}
                onPrev={prevChapter ? () => document.getElementById(`learn-${prevChapter.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }) : undefined}
                onNext={nextChapter ? () => document.getElementById(`learn-${nextChapter.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }) : undefined}
              />
            )}
          </article>
        );
      })}
    </GoogleGate>
  );
}
