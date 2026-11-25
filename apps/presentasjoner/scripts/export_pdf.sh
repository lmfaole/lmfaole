#!/usr/bin/env bash
# Exports a talk to PDF with PowerPoint and puts it in the R2 bucket `presentasjoner`, at `<slug>/<the .pptx's name>.pdf`, where the site serves it
# (`/presentasjoner/<slug>/<the .pptx's name>.pdf`). macOS with Microsoft PowerPoint, and wrangler logged in to the account (`npx wrangler login`).
#
# Usage: scripts/export_pdf.sh <pptx> <slug>        (from apps/presentasjoner; <slug> is the folder in content/)
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Bruk: $0 <pptx> <slug>" >&2
  exit 2
fi

pptx="$1"
slug="$2"
here="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -f "$pptx" ]; then
  echo "Finner ikke $pptx" >&2
  exit 1
fi
if [ ! -f "$here/content/$slug/presentasjon.json" ]; then
  echo "Finner ikke content/$slug/presentasjon.json: <slug> er mappen i content/" >&2
  exit 1
fi

name="$(basename "$pptx")"
stem="${name%.*}"
expected="$(python3 -c 'import json, sys; print(json.load(open(sys.argv[1], encoding="utf-8"))["file"])' "$here/content/$slug/presentasjon.json")"
if [ "$name" != "$expected" ]; then
  echo "content/$slug/presentasjon.json gjelder $expected, ikke $name" >&2
  exit 1
fi

# PowerPoint is sandboxed: it can only write inside its own container.
outdir="$HOME/Library/Containers/com.microsoft.Powerpoint/Data/tmp-pdf"
pdf="$outdir/$stem.pdf"
mkdir -p "$outdir"
rm -f "$pdf"
trap 'rm -f "$pdf"' EXIT

# The deck has to be open in PowerPoint to be saved as PDF.
open -a "Microsoft PowerPoint" "$pptx"
for _ in $(seq 1 30); do
  if osascript -e "tell application \"Microsoft PowerPoint\" to get name of presentation \"$name\"" >/dev/null 2>&1; then break; fi
  sleep 1
done

osascript -e "tell application \"Microsoft PowerPoint\" to save presentation \"$name\" in (POSIX file \"$pdf\") as save as PDF"
if [ ! -s "$pdf" ]; then
  echo "PowerPoint laget ingen PDF ($pdf)" >&2
  exit 1
fi

(cd "$here" && npx wrangler r2 object put "presentasjoner/$slug/$stem.pdf" --file "$pdf" --content-type application/pdf --remote)
echo "Lastet opp: https://lmfaole.party/presentasjoner/$slug/$stem.pdf"
