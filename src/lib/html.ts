const ALLOWED = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "H2", "H3", "UL", "OL", "LI", "A", "IMG", "BLOCKQUOTE"]);
const ATTRS: Record<string, string[]> = {
  A: ["href", "target", "rel"],
  IMG: ["src", "alt"],
};

export function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function sanitizeHtml(html: string): string {
  if (typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const walk = (node: ParentNode) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.parentNode?.removeChild(child);
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const el = child as HTMLElement;
      if (!ALLOWED.has(el.tagName)) {
        const parent = el.parentNode;
        while (el.firstChild) parent?.insertBefore(el.firstChild, el);
        parent?.removeChild(el);
        return;
      }
      [...el.attributes].forEach((attr) => {
        if (!ATTRS[el.tagName]?.includes(attr.name.toLowerCase())) el.removeAttribute(attr.name);
      });
      if (el.tagName === "A") {
        const href = el.getAttribute("href") ?? "";
        if (!/^https?:\/\//i.test(href) && !href.startsWith("mailto:")) el.removeAttribute("href");
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noreferrer");
      }
      if (el.tagName === "IMG") {
        const src = el.getAttribute("src") ?? "";
        if (!/^(https?:|data:image\/)/i.test(src)) el.remove();
      }
      walk(el);
    });
  };
  walk(doc.body);
  return doc.body.innerHTML;
}

export function lessonHtml(body: string): string {
  if (!body.trim()) return "";
  if (looksLikeHtml(body)) return sanitizeHtml(body);
  return body
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeText(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function youtubeId(url: string): string | null {
  const m = url.trim().match(/(?:youtu\.be\/|[?&]v=|youtube\.com\/(?:embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  const bare = url.trim().match(/^([A-Za-z0-9_-]{11})$/);
  return bare?.[1] ?? null;
}

export function toEmbedUrl(raw: string): string {
  const id = youtubeId(raw);
  return id ? `https://www.youtube.com/embed/${id}` : raw.trim();
}

export function embedWithStart(url: string, start?: number): string {
  const id = youtubeId(url);
  if (!id) return url;
  const q = start && start > 0 ? `?start=${start}&autoplay=1&rel=0` : "?rel=0";
  return `https://www.youtube.com/embed/${id}${q}`;
}

export function stampToSec(stamp: string): number {
  const parts = stamp.split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

export function secToStamp(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  const ss = String(r).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

export function parseChapterText(text: string): { t: number; label: string }[] {
  const out: { t: number; label: string }[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.trim().match(/^\[?((?:\d{1,2}:)?\d{1,2}:\d{2})\]?\s+[–—-]?\s*(.+)$/);
    if (!m) continue;
    const label = m[2].replace(/\s+/g, " ").trim().replace(/^[–—-]\s*/, "");
    if (label) out.push({ t: stampToSec(m[1]), label });
  }
  return out;
}

export function formatChapterText(chapters: { t: number; label: string }[]): string {
  return chapters.map((c) => `${secToStamp(c.t)} ${c.label}`).join("\n");
}
