#!/usr/bin/env python3
"""Write a presentation's content (presentasjon.json) from its .pptx.

Usage: pptx_to_json.py <folder>/<file>.pptx [<repo folder>]

The .pptx is not versioned, so presentasjon.json is what the repo keeps of it: per slide the layout, title,
text by placeholder, text boxes, pictures (as files in the folder's bilder/, matched by content), video and
audio, links, the time stamp and the speaker notes. The format is presentasjon.schema.json; check.py checks it.

<repo folder> is where presentasjon.json and bilder/ live (default: the .pptx's folder), for when the
.pptx is kept outside this repo (apps/presentasjoner/content/<år>-...). Needs python-pptx.

What the .pptx does not know (summary, event, date, duration, or any other top-level field) is written by hand
in presentasjon.json and kept as it is when the file is made again.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE

P = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
DECORATIVE = "{http://schemas.microsoft.com/office/drawing/2017/decorative}decorative"
TIME = re.compile(r"^\[(\d+:\d\d(?:–\d+:\d\d)?)\]\s*")


def paragraphs(tf):
    """A paragraph is a string, or [text, level] when it is indented (as in build_deck.py)."""
    out = []
    for p in tf.paragraphs:
        text = p.text.strip()
        if text:
            out.append(text if p.level == 0 else [text, p.level])
    return out


def c_nv_pr(shape):
    return next(shape._element.iter(f"{P}cNvPr"), None)


def alt_text(shape):
    el = c_nv_pr(shape)
    return (el.get("descr") or "").strip() if el is not None else ""


def decorative(shape):
    el = c_nv_pr(shape)
    return el is not None and any(d.get("val") == "1" for d in el.iter(DECORATIVE))


def links(shape):
    found = []
    if shape.has_text_frame:
        for p in shape.text_frame.paragraphs:
            for r in p.runs:
                if r.hyperlink.address:
                    found.append({"text": r.text.strip(), "url": r.hyperlink.address})
    try:
        address = shape.click_action.hyperlink.address
    except (AttributeError, KeyError):
        address = None
    if address:
        found.append({"text": shape.text_frame.text.strip() if shape.has_text_frame else shape.name, "url": address})
    return found


def media(shape, slide):
    """Video or audio in the slide: its name in the .pptx and alt text; the file itself is not versioned."""
    rids = [el.get(f"{R}link") or el.get(f"{R}embed") for el in shape._element.iter()
            if el.tag.endswith(("}videoFile", "}audioFile", "}media"))]
    target = next((Path(slide.part.rels[r].target_ref).name for r in rids if r and r in slide.part.rels), None)
    kind = "audio" if any(el.tag.endswith("}audioFile") for el in shape._element.iter()) else "video"
    item = {"kind": kind, "name": shape.name, "file": target, "alt": alt_text(shape)}
    if decorative(shape):
        item["decorative"] = True
    return item


CHART_KINDS = {"COLUMN": "column", "BAR": "bar", "LINE": "line", "AREA": "area", "PIE": "pie", "DOUGHNUT": "pie"}


def chart(shape):
    """A chart's numbers: its categories and one series per row, so the site can draw them itself instead of keeping a picture of them.

    The type is simplified to the six the schema has; anything else is "other" and the site reads the numbers, not the shape.
    """
    ch = shape.chart
    try:
        name = ch.chart_type.name
    except (AttributeError, ValueError):  # a chart type python-pptx does not know
        name = ""
    item = {"kind": next((v for k, v in CHART_KINDS.items() if name.startswith(k)), "other")}
    if ch.has_title and (title := ch.chart_title.text_frame.text.strip()):
        item["title"] = title
    # A category can be a number or a date in the .pptx; the site shows it as the words it is.
    item["categories"] = [str(c) for c in ch.plots[0].categories]
    item["series"] = [{"name": s.name or "", "values": list(s.values)} for s in ch.series]
    return item


def picture(shape, images):
    blob = shape.image.blob
    item = {"file": images.get(hashlib.sha256(blob).hexdigest())}
    if item["file"] is None:
        item["missing"] = f"{shape.image.filename or shape.name}, {len(blob)} bytes"
    if shape.is_placeholder:
        item["placeholder"] = shape.placeholder_format.idx
    item["alt"] = alt_text(shape)
    if decorative(shape):
        item["decorative"] = True
    return item


def slide_json(n, slide, images):
    out = {"n": n, "layout": slide.slide_layout.name}
    if slide._element.get("show") == "0":
        out["hidden"] = True
    title = slide.shapes.title
    out["title"] = (title.text_frame.text.strip() or None) if title is not None else None
    text, boxes, pictures, clips, charts, found = {}, [], [], [], [], []
    for shape in slide.shapes:
        found += links(shape)
        if shape.shape_type == MSO_SHAPE_TYPE.MEDIA:
            clips.append(media(shape, slide))
            continue
        # Before the picture: a chart is a GraphicFrame with no .image, so picture() would swallow it and it would be lost in silence.
        if shape.has_chart:
            charts.append(chart(shape))
            continue
        try:
            pictures.append(picture(shape, images))
            continue
        except (AttributeError, ValueError):  # not a picture, or an empty picture placeholder
            pass
        if shape.is_placeholder and shape.has_text_frame:
            if shape.placeholder_format.idx != 0 and (ps := paragraphs(shape.text_frame)):
                text[str(shape.placeholder_format.idx)] = ps
        elif shape.has_text_frame and (ps := paragraphs(shape.text_frame)):
            boxes.append(ps)
    for key, value in (("text", text), ("textboxes", boxes), ("pictures", pictures), ("charts", charts),
                       ("media", clips), ("links", found)):
        if value:
            out[key] = value
    notes = slide.notes_slide.notes_text_frame.text.strip() if slide.has_notes_slide else ""
    if m := TIME.match(notes):
        out["time"] = m.group(1)
    if notes:
        out["notes"] = notes
    return out


def main():
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    pptx = Path(sys.argv[1]).resolve()
    folder = Path(sys.argv[2]).resolve() if len(sys.argv) == 3 else pptx.parent
    images = {hashlib.sha256(f.read_bytes()).hexdigest(): f"bilder/{f.name}"
              for f in sorted((folder / "bilder").glob("*")) if f.is_file() and f.suffix.lower() != ".md"}
    prs = Presentation(pptx)
    ratio = round(prs.slide_width / prs.slide_height, 2)
    slides = [slide_json(n, s, images) for n, s in enumerate(prs.slides, 1)]
    out = folder / "presentasjon.json"
    deck = {
        "$schema": "../../presentasjon.schema.json",
        "title": next((s["title"] for s in slides if s["title"]), pptx.stem),
        "file": pptx.name,
        "aspect": {1.78: "16:9", 1.33: "4:3"}.get(ratio, str(ratio)),
    }
    # The fields written by hand (summary, event, date, duration …) are kept, in their order, before the slides.
    if out.exists():
        before = json.loads(out.read_text(encoding="utf-8"))
        deck.update({k: v for k, v in before.items() if k not in deck and k != "slides"})
    deck["slides"] = slides
    out.write_text(json.dumps(deck, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    missing = [f"slide {s['n']}: {p['missing']}" for s in slides for p in s.get("pictures", []) if "missing" in p]
    print(f"Wrote {out} ({len(slides)} slides)" + "".join(f"\n  not in bilder/: {m}" for m in missing))


if __name__ == "__main__":
    main()
