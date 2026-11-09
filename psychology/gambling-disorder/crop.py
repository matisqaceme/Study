"""Cover-crop each photo to the exact aspect ratio of its box on the slide.

Each crop keeps the full height or width of the source (whichever limits),
centres on a focal point, and never stretches. Output goes to img/crops/.
"""
from pathlib import Path
from PIL import Image

HERE = Path(__file__).parent
SRC = HERE / "img"
OUT = SRC / "crops"
OUT.mkdir(exist_ok=True)

# name: (source file, box width in, box height in, focal x 0-1, focal y 0-1)
CROPS = {
    "s1_A": ("A.jpg", 13.333, 4.6, 0.50, 0.55),
    "s2_B": ("B.jpg", 6.000, 7.5, 0.30, 0.50),
    "s3_C": ("C.jpg", 6.667, 7.5, 0.55, 0.50),
    "s4_D": ("D.jpg", 13.333, 2.0, 0.50, 0.50),
    "s5_E": ("E.jpg", 5.333, 7.5, 0.22, 0.50),
    "s6_F": ("F.jpg", 5.333, 7.5, 0.80, 0.50),
    "s7_G": ("G.jpg", 13.333, 3.5, 0.50, 0.65),
}

MAX_PPI = 180  # 2400 px across a full-width photo: crisp on 1080p and 4K projectors


def cover_crop(img, box_w, box_h, fx, fy):
    sw, sh = img.size
    target = box_w / box_h
    if sw / sh > target:  # source too wide: trim the sides
        cw, ch = round(sh * target), sh
    else:  # source too tall: trim top and bottom
        cw, ch = sw, round(sw / target)
    left = min(max(round(fx * sw - cw / 2), 0), sw - cw)
    top = min(max(round(fy * sh - ch / 2), 0), sh - ch)
    return img.crop((left, top, left + cw, top + ch))


for name, (src, w, h, fx, fy) in CROPS.items():
    im = Image.open(SRC / src).convert("RGB")
    crop = cover_crop(im, w, h, fx, fy)
    max_w = round(w * MAX_PPI)
    if crop.width > max_w:
        crop = crop.resize((max_w, round(max_w * h / w)), Image.LANCZOS)
    crop.save(OUT / f"{name}.jpg", quality=86, optimize=True, progressive=True)
    print(f"{name}: {src} -> {crop.size}, ratio {crop.width / crop.height:.4f} vs box {w / h:.4f}")
