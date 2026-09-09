/** עיגול קטן שעף לדשבורד — פעם אחת בכל סימון, בלי הצפה. */

let flying = false;
let lastAt = 0;

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function flyMarkToDash(from: EventTarget | null, color: string): void {
  if (!(from instanceof Element) || reducedMotion()) return;
  const now = Date.now();
  if (flying || now - lastAt < 520) return;
  lastAt = now;
  flying = true;

  const start = from.getBoundingClientRect();
  const dash = document.getElementById("live-dash");
  const dashRect = dash?.getBoundingClientRect();
  const navH = 76;
  let x1: number;
  let y1: number;
  if (dashRect && dashRect.top < window.innerHeight - navH && dashRect.bottom > 40) {
    x1 = dashRect.left + dashRect.width * 0.72;
    y1 = dashRect.top + 22;
  } else {
    x1 = window.innerWidth / 2;
    y1 = window.innerHeight - navH - 22;
  }
  const x0 = start.left + start.width / 2;
  const y0 = start.top + start.height / 2;
  const mx = x0 + (x1 - x0) * 0.42 + (x1 >= x0 ? -36 : 36);
  const my = Math.min(y0, y1) - 56;

  const el = document.createElement("span");
  el.className = "fly-dot";
  el.style.background = color;
  el.setAttribute("aria-hidden", "true");
  document.body.appendChild(el);

  const anim = el.animate(
    [
      { transform: `translate(${x0 - 9}px, ${y0 - 9}px) scale(0.35)`, opacity: 0 },
      { transform: `translate(${x0 - 9}px, ${y0 - 9}px) scale(1)`, opacity: 1, offset: 0.14 },
      { transform: `translate(${mx - 9}px, ${my - 9}px) scale(1.08)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${x1 - 9}px, ${y1 - 9}px) scale(0.4)`, opacity: 0.15 },
    ],
    { duration: 780, easing: "cubic-bezier(.22,.72,.18,1)", fill: "forwards" },
  );

  const done = () => {
    el.remove();
    flying = false;
    dash?.classList.add("live-dash-pulse");
    window.setTimeout(() => dash?.classList.remove("live-dash-pulse"), 650);
  };
  anim.addEventListener("finish", done);
  anim.addEventListener("cancel", done);
}
