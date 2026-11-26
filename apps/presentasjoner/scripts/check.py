#!/usr/bin/env python3
"""Check that every presentation folder (apps/presentasjoner/content/<år>-...) has a README.md and a valid presentasjon.json.

Usage: check.py [<apps/presentasjoner folder>]   (no dependencies; exits 1 on errors)

presentasjon.json is checked against presentasjon.schema.json (the subset of JSON Schema it uses), and:
slides are numbered 1..N, pictures exist in bilder/, every picture and video has alt text unless it is
marked decorative, and the date (when there is one) is a real day.
"""
import datetime
import json
import re
import sys
from pathlib import Path

TYPES = {"object": dict, "array": list, "string": str, "number": (int, float), "boolean": bool, "null": type(None)}


def is_type(value, name):
    if name == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    return isinstance(value, TYPES[name]) and not (name != "boolean" and isinstance(value, bool))


def validate(value, schema, root, path="$"):
    """The JSON Schema keywords presentasjon.schema.json uses; returns a list of errors."""
    if "$ref" in schema:
        schema = root["$defs"][schema["$ref"].removeprefix("#/$defs/")]
    if "anyOf" in schema:
        return [] if any(not validate(value, s, root, path) for s in schema["anyOf"]) else [f"{path}: matches none of the allowed forms"]
    types = schema.get("type")
    if types and not any(is_type(value, t) for t in ([types] if isinstance(types, str) else types)):
        return [f"{path}: expected {types}, got {json.dumps(value, ensure_ascii=False)[:60]}"]
    errors = []
    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{path}: must be one of {schema['enum']}")
    if isinstance(value, str):
        if len(value) < schema.get("minLength", 0):
            errors.append(f"{path}: is empty")
        if "pattern" in schema and not re.search(schema["pattern"], value):
            errors.append(f"{path}: {value!r} does not match {schema['pattern']}")
    if is_type(value, "integer") and value < schema.get("minimum", value):
        errors.append(f"{path}: must be at least {schema['minimum']}")
    if isinstance(value, list):
        if not schema.get("minItems", 0) <= len(value) <= schema.get("maxItems", len(value)):
            errors.append(f"{path}: wrong number of items")
        for i, item in enumerate(value):
            prefix = schema.get("prefixItems", [])
            sub = prefix[i] if i < len(prefix) else schema.get("items")
            if sub:
                errors += validate(item, sub, root, f"{path}[{i}]")
    if isinstance(value, dict):
        props = schema.get("properties", {})
        errors += [f"{path}: missing {k}" for k in schema.get("required", []) if k not in value]
        for k, v in value.items():
            if "propertyNames" in schema:
                errors += validate(k, schema["propertyNames"], root, f"{path} key {k!r}")
            if k in props:
                errors += validate(v, props[k], root, f"{path}.{k}")
            elif schema.get("additionalProperties") is False:
                errors.append(f"{path}: unknown property {k}")
            elif isinstance(schema.get("additionalProperties"), dict):
                errors += validate(v, schema["additionalProperties"], root, f"{path}.{k}")
    return errors


def check_deck(folder, schema):
    deck_file = folder / "presentasjon.json"
    if not deck_file.exists():
        return [f"missing presentasjon.json (make it with scripts/pptx_to_json.py)"]
    try:
        deck = json.loads(deck_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return [f"presentasjon.json is not JSON: {e}"]
    errors = validate(deck, schema, schema)
    if errors:
        return errors
    if (folder / deck.get("$schema", "")).resolve() != (folder.parent.parent / "presentasjon.schema.json").resolve():
        errors.append(f"$schema: {deck.get('$schema')!r} is not ../../presentasjon.schema.json")
    if "date" in deck:
        try:
            datetime.date.fromisoformat(deck["date"])
        except ValueError:
            errors.append(f"date: {deck['date']} is not a day")
    for i, slide in enumerate(deck["slides"], 1):
        where = f"slide {i}"
        if slide["n"] != i:
            errors.append(f"{where}: n is {slide['n']}, expected {i}")
        for pic in slide.get("pictures", []):
            if not (folder / pic["file"]).is_file():
                errors.append(f"{where}: {pic['file']} does not exist")
        for item in slide.get("pictures", []) + slide.get("media", []):
            if not item["alt"].strip() and not item.get("decorative"):
                errors.append(f"{where}: {item.get('file') or item.get('name')} has no alt text and is not marked decorative")
        # A chart's numbers only mean something as a grid: one value per category in every series. The schema cannot say it.
        for j, chart in enumerate(slide.get("charts", []), 1):
            for series in chart["series"]:
                if len(series["values"]) != len(chart["categories"]):
                    errors.append(
                        f"{where}: chart {j}, series {series['name']!r} has {len(series['values'])} values"
                        f" for {len(chart['categories'])} categories"
                    )
    return errors


def main():
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent
    schema = json.loads((root / "presentasjon.schema.json").read_text(encoding="utf-8"))
    content = root / "content"
    folders = sorted(p for p in content.iterdir() if p.is_dir() and re.match(r"^\d{4}-", p.name)) if content.is_dir() else []
    failed = False
    for folder in folders:
        errors = ([] if (folder / "README.md").is_file() else ["missing README.md"]) + check_deck(folder, schema)
        failed |= bool(errors)
        print(f"{'✗' if errors else '✓'} {folder.name}" + "".join(f"\n    {e}" for e in errors))
    if not folders:
        print("no presentation folders")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
