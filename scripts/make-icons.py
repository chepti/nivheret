"""יוצר אייקוני PWA ותמונת שיתוף מצבעי הנבחרת."""
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise SystemExit("pip install pillow")

root = Path(__file__).resolve().parents[1] / "public"
root.mkdir(exist_ok=True)

def canvas(size: int, pad: bool = False) -> Image.Image:
    img = Image.new("RGB", (size, size), "#f5c518")
    draw = ImageDraw.Draw(img)
    inner = int(size * (0.18 if pad else 0.12))
    draw.ellipse((inner, inner, size - inner, size - inner), fill="#fff6df")
    # eyes + smile
    e = size // 14
    y = size // 2 - e
    draw.ellipse((size * 0.35 - e, y, size * 0.35 + e, y + e * 2), fill="#2a2430")
    draw.ellipse((size * 0.65 - e, y, size * 0.65 + e, y + e * 2), fill="#2a2430")
    draw.arc((size * 0.32, size * 0.48, size * 0.68, size * 0.72), 20, 160, fill="#2a2430", width=max(2, size // 28))
    return img

for name, size, pad in [("icon-192.png", 192, False), ("icon-512.png", 512, False), ("icon-512-maskable.png", 512, True), ("apple-touch-icon.png", 180, False)]:
    canvas(size, pad).save(root / name, "PNG")

# favicon 32
canvas(32).save(root / "favicon.ico", sizes=[(16, 16), (32, 32)])

og = Image.new("RGB", (1200, 630), "#fff6df")
d = ImageDraw.Draw(og)
d.ellipse((-120, -180, 420, 360), fill="#ffe56a")
d.ellipse((860, 280, 1380, 820), fill="#ffd0e4")
d.rounded_rectangle((80, 90, 1120, 540), radius=48, fill="#ffffff")
try:
    font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 86)
    small = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 36)
except OSError:
    font = ImageFont.load_default()
    small = font
d.text((140, 200), "נבחרת", font=font, fill="#2a2430", anchor="ls")
d.text((140, 320), "למידה צוותית · אולפנת צביה", font=small, fill="#7a7380", anchor="ls")
og.save(root / "og-image.png", "PNG", optimize=True)
print("icons ok")
