#!/usr/bin/env python3
"""Build a .pptx from a JSON (or YAML) outline using python-pptx.

Usage: build_deck.py outline.json out.pptx [--template base.pptx [--keep-existing]]

Outline:
{
  "theme": {"font": "Calibri", "title_color": "1F3864", "accent": "2E75B6"},   # optional
  "layouts": {"title": "Forside", "section": "Skilleark sort", "bullets": "Uten linje"},  # optional, for --template
  "slides": [
    {"type": "title",   "title": "Deck", "subtitle": "Sub", "extra": {"20": "Author"}, "notes": "..."},
    {"type": "section", "title": "Part 1"},
    {"type": "bullets", "title": "T", "bullets": ["a", ["nested", 1], "b"], "image": "pic.png", "alt": "What it shows"},
    {"type": "image",   "title": "T", "image": "pic.png", "alt": "What it shows"},
    {"type": "chart",   "title": "T", "chart": {"kind": "bar|column|line|pie",
                         "categories": ["A","B"], "series": {"2024": [1,2]}}},
    {"type": "table",   "title": "T", "table": [["H1","H2"],["a","b"]]}
  ]
}
Bullets: a string is level 0; [text, level] sets the level; {"text": …, "level": 1, "url": …} links the line.
A "bullets" slide takes an "image" or a "chart" beside the text. "alt" is the alt text of the slide's picture
or chart, which a screen reader and PowerPoint's accessibility check read. Every slide accepts "notes".
Relative image paths resolve against the outline's directory.
"""
import argparse
import json
import sys
from pathlib import Path

from pptx import Presentation
from pptx.chart.data import CategoryChartData
from pptx.dml.color import RGBColor
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION
from pptx.util import Inches, Pt

CHARTS = {
    "bar": XL_CHART_TYPE.BAR_CLUSTERED,
    "column": XL_CHART_TYPE.COLUMN_CLUSTERED,
    "line": XL_CHART_TYPE.LINE_MARKERS,
    "pie": XL_CHART_TYPE.PIE,
}


def load_outline(path):
    text = Path(path).read_text(encoding="utf-8")
    if path.lower().endswith((".yml", ".yaml")):
        import yaml  # pip install pyyaml
        return yaml.safe_load(text)
    return json.loads(text)


def rgb(hex_):
    return RGBColor.from_string(hex_.lstrip("#").upper())


def layout(prs, name, idx):
    # Prefer name so custom templates work; fall back to default-template index
    for lo in prs.slide_layouts:
        if lo.name == name:
            return lo
    return prs.slide_layouts[idx]


def style_title(slide, theme, content=True):
    t = slide.shapes.title
    if t is None:
        return
    for p in t.text_frame.paragraphs:
        for r in p.runs:
            if theme.get("title_pt") and content:
                r.font.size = Pt(theme["title_pt"])
            if theme.get("font"):
                r.font.name = theme["font"]
            if theme.get("title_color"):
                r.font.color.rgb = rgb(theme["title_color"])


def body_box(prs, slide):
    """Area below the title as (left, top, width, height)."""
    title = slide.shapes.title
    top = (title.top + title.height + Inches(0.2)) if title is not None else Inches(1.5)
    margin = Inches(0.6)
    return margin, top, prs.slide_width - 2 * margin, prs.slide_height - top - Inches(0.5)


def bullet(item):
    """A bullet as (text, level, url): a string, [text, level], or {"text": …, "level": …, "url": …}."""
    if isinstance(item, str):
        return item, 0, None
    if isinstance(item, dict):
        return item["text"], int(item.get("level", 0)), item.get("url")
    return item[0], int(item[1]), None


def fill_bullets(tf, items, theme):
    tf.clear()
    first = True
    for item in items:
        text, level, url = bullet(item)
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.text = text
        p.level = level
        for r in p.runs:
            if url:
                r.hyperlink.address = url
            if theme.get("body_pt"):
                r.font.size = Pt(theme["body_pt"])
            if theme.get("font"):
                r.font.name = theme["font"]


def set_alt(shape, alt):
    """The alt text a screen reader and PowerPoint's accessibility check read."""
    if not alt:
        return
    el = next(shape._element.iter("{http://schemas.openxmlformats.org/presentationml/2006/main}cNvPr"), None)
    if el is not None:
        el.set("descr", alt)


def add_picture_fit(slide, path, box, alt=None):
    left, top, width, height = box
    pic = slide.shapes.add_picture(str(path), left, top)
    scale = min(width / pic.width, height / pic.height)
    pic.width, pic.height = int(pic.width * scale), int(pic.height * scale)
    pic.left = int(left + (width - pic.width) / 2)
    pic.top = int(top + (height - pic.height) / 2)
    set_alt(pic, alt)
    return pic


def add_chart(slide, spec, box, theme, alt=None):
    cd = CategoryChartData()
    cd.categories = spec["categories"]
    for name, values in spec["series"].items():
        cd.add_series(name, values)
    kind = spec.get("kind", "column")
    left, top, width, height = box
    frame = slide.shapes.add_chart(CHARTS[kind], left, top, width, height, cd)
    set_alt(frame, alt)
    chart = frame.chart
    chart.has_legend = len(spec["series"]) > 1 or kind == "pie"
    if chart.has_legend:
        chart.legend.position = XL_LEGEND_POSITION.BOTTOM
        chart.legend.include_in_layout = False
    if kind != "pie" and theme.get("accent") and len(spec["series"]) == 1:
        fill = chart.plots[0].series[0].format.fill
        fill.solid()
        fill.fore_color.rgb = rgb(theme["accent"])
    return chart


def add_table(slide, rows, box, theme):
    left, top, width, _ = box
    n_rows, n_cols = len(rows), max(len(r) for r in rows)
    shape = slide.shapes.add_table(n_rows, n_cols, left, top, width, Inches(0.5) * n_rows)
    for r, row in enumerate(rows):
        for c in range(n_cols):
            cell = shape.table.cell(r, c)
            cell.text = str(row[c]) if c < len(row) else ""
            for p in cell.text_frame.paragraphs:
                for run in p.runs:
                    run.font.size = Pt(16)
                    if theme.get("font"):
                        run.font.name = theme["font"]
    if theme.get("accent"):
        for c in range(n_cols):
            cell = shape.table.cell(0, c)
            cell.fill.solid()
            cell.fill.fore_color.rgb = rgb(theme["accent"])
    return shape


def resolve(path, base):
    p = Path(path)
    p = p if p.is_absolute() else base / p
    if not p.exists():
        sys.exit(f"Image not found: {p}")
    return p


def make_16x9(prs):
    """Resize to 13.333x7.5in and stretch master/layout shapes horizontally;
    python-pptx only changes the slide size, not the placeholder geometry."""
    factor = Inches(13.333) / prs.slide_width
    prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)
    for holder in [prs.slide_master, *prs.slide_layouts]:
        for sh in holder.shapes:
            if sh._element.spPr.find("{http://schemas.openxmlformats.org/drawingml/2006/main}xfrm") is None:
                continue  # inherits geometry from the master, already scaled
            if sh.left is not None and sh.width is not None:
                sh.left, sh.width = int(sh.left * factor), int(sh.width * factor)


def drop_existing_slides(prs):
    """Remove all slides from a template deck, keeping masters/layouts/theme."""
    lst = prs.slides._sldIdLst
    for sld in list(lst):
        prs.part.drop_rel(sld.rId)
        lst.remove(sld)


def prune_empty(slide):
    """Delete placeholders left empty so no 'click to add' prompts remain."""
    for ph in list(slide.placeholders):
        if ph.has_text_frame and not ph.text_frame.text.strip():
            ph._element.getparent().remove(ph._element)
        elif not ph.has_text_frame and ph.placeholder_format.type is not None and ph.shape_type == 14:
            ph._element.getparent().remove(ph._element)


def build(outline, out, base, template=None, keep_existing=False):
    theme = outline.get("theme", {})
    names = outline.get("layouts", {})  # optional: slide type -> layout name in the template
    prs = Presentation(template) if template else Presentation()
    n_existing = len(prs.slides) if keep_existing else 0
    if template and not keep_existing:
        drop_existing_slides(prs)
    elif not template:  # default template is 4:3
        make_16x9(prs)

    for spec in outline["slides"]:
        kind = spec.get("type") or ("bullets" if "bullets" in spec else "title")
        title = spec.get("title", "")
        nm = {**names, kind: spec["layout"]} if spec.get("layout") else names  # per-slide override
        if kind == "title":
            s = prs.slides.add_slide(layout(prs, nm.get("title", "Title Slide"), 0))
            s.shapes.title.text = title
            if len(s.placeholders) > 1:
                list(s.placeholders)[1].text = spec.get("subtitle", "")
            for idx, text in (spec.get("extra") or {}).items():  # fill other placeholders by idx
                s.placeholders[int(idx)].text = text
        elif kind == "section":
            s = prs.slides.add_slide(layout(prs, nm.get("section", "Section Header"), 2))
            s.shapes.title.text = title
            for ph in list(s.placeholders)[1:]:
                if spec.get("subtitle"):
                    ph.text = spec["subtitle"]
                else:
                    ph._element.getparent().remove(ph._element)
        elif kind == "bullets":
            s = prs.slides.add_slide(layout(prs, nm.get("bullets", "Title and Content"), 1))
            s.shapes.title.text = title
            body = list(s.placeholders)[1]
            fill_bullets(body.text_frame, spec.get("bullets", []), theme)
            if spec.get("image") or spec.get("chart"):  # text left, picture or chart right
                left, top, width, height = body.left, body.top, body.width, body.height
                body.width = int(width * 0.5)
                box = (left + int(width * 0.55), top, int(width * 0.45), height)
                if spec.get("image"):
                    add_picture_fit(s, resolve(spec["image"], base), box, spec.get("alt"))
                else:
                    add_chart(s, spec["chart"], box, theme, spec.get("alt"))
        else:
            s = prs.slides.add_slide(layout(prs, nm.get("other", "Title Only"), 5))
            s.shapes.title.text = title
            box = body_box(prs, s)
            if kind == "image":
                add_picture_fit(s, resolve(spec["image"], base), box, spec.get("alt"))
            elif kind == "chart":
                add_chart(s, spec["chart"], box, theme, spec.get("alt"))
            elif kind == "table":
                add_table(s, spec["table"], box, theme)
            else:
                sys.exit(f"Unknown slide type: {kind}")
        if template:
            prune_empty(s)
        style_title(s, theme, content=kind not in ("title", "section"))
        if spec.get("hidden"):
            s._element.set("show", "0")
        if spec.get("notes"):
            s.notes_slide.notes_text_frame.text = spec["notes"]

    if n_existing:  # new slides first; the template's original slides follow, hidden, as an appendix
        lst = prs.slides._sldIdLst
        ids = list(lst)
        for sld in ids[:n_existing]:
            lst.remove(sld)
            lst.append(sld)
        for slide in list(prs.slides)[-n_existing:]:
            slide._element.set("show", "0")

    prs.save(out)
    return len(prs.slides)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    ap.add_argument("outline")
    ap.add_argument("output")
    ap.add_argument("--template", help="existing .pptx whose masters/layouts/theme to reuse")
    ap.add_argument("--keep-existing", action="store_true",
                    help="keep the template's slides, hidden, after the new ones (appendix)")
    a = ap.parse_args()
    n = build(load_outline(a.outline), a.output, Path(a.outline).resolve().parent, a.template, a.keep_existing)
    print(f"Wrote {a.output} ({n} slides)")


if __name__ == "__main__":
    main()
