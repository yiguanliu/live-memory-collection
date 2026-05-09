"""One-off: inline downscaled photos into index.html as base64 data URIs.

The Figma MCP export for Eliza came back blank, and the IDE preview panel
may load index.html over file:// — embedding the images guarantees they
render in any context.
"""
from __future__ import annotations

import base64
import io
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).parent
ASSETS = ROOT / "assets"
HTML = ROOT / "index.html"

# (filename, target_width)
PHOTOS = [
    ("jamie.png",   320),
    ("anthony.png", 320),
    ("hazel.png",   400),
    ("layla.png",   320),
    ("eliza.png",   320),
]


def encode(path: Path, width: int) -> str:
    img = Image.open(path).convert("RGB")
    ratio = width / img.width
    img = img.resize((width, int(img.height * ratio)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=78, optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{b64}"


def is_blank(path: Path) -> bool:
    img = Image.open(path).convert("RGB")
    extrema = img.getextrema()
    return all(lo >= 250 and hi >= 250 for lo, hi in extrema)


def main() -> None:
    html = HTML.read_text(encoding="utf-8")

    for name, width in PHOTOS:
        path = ASSETS / name
        src_attr = f'src="assets/{name}"'
        if is_blank(path):
            print(f"  skip (blank): {name}")
            continue
        data_uri = encode(path, width)
        if src_attr not in html:
            print(f"  miss: {src_attr} not found")
            continue
        html = html.replace(src_attr, f'src="{data_uri}"', 1)
        print(f"  inlined: {name} ({len(data_uri) // 1024} KB base64)")

    HTML.write_text(html, encoding="utf-8")


if __name__ == "__main__":
    main()
