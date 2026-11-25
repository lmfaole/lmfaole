/**
 * The rules of 10.0.0 (one component per use case; apps pass data, never appearance) that are not a prop list (`strict.test.ts`).
 * Each group of 10.0.0 adds its own rules here.
 */

import { strict as assert } from "node:assert"
import { readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"
import { test } from "node:test"

const src = import.meta.dirname
const read = (path: string): string => readFileSync(join(src, path), "utf8")

/** The public component files: what `./components/*` exports (not `internal/` or `ui/`). */
const publicComponents = readdirSync(join(src, "components"), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
  .map((entry) => join(src, "components", entry.name))

test("1. a PageSection without an icon does not type-check (src/rules/types.tsx)", () => {
  const types = read("rules/types.tsx")
  assert.match(types, /@ts-expect-error: PageSection requires `icon`\n\s*<PageSection (?![^>]*\bicon=)/)
  const section = read("components/page-section.tsx")
  const start = section.indexOf("export function PageSection")
  assert.match(section.slice(start, section.indexOf(")) {", start)), /\bicon: IconName\b/, "PageSection's `icon` is required")
})

test("1b. Text takes a role and Stack two gaps: the type rules are still there (src/rules/types.tsx)", () => {
  const types = read("rules/types.tsx")
  for (const rule of ["Text has no `size`", "Text has no `tone`", "Stack has no `xl`"]) assert.ok(types.includes(`@ts-expect-error: ${rule}`), rule)
})

test("4. no Split, SectionGroup or SubSection in the public components: a detail page's two columns are DetailLayout's", () => {
  const found = publicComponents.filter((file) => /export (?:function|const) (?:Split|SectionGroup|SubSection)\b|export \{[^}]*\b(?:Split|SectionGroup|SubSection)\b/.test(readFileSync(file, "utf8")))
  assert.deepEqual(found.map((file) => relative(src, file)), [])
})

test("Code, CopyButton are deleted; Card, Separator and the picture frame are internal: not exported to apps", () => {
  const exports: Record<string, string | null> = JSON.parse(readFileSync(join(src, "../package.json"), "utf8")).exports
  for (const path of ["./components/card", "./components/separator", "./components/internal/*", "./components/ui/*"]) assert.equal(exports[path], null, `${path} is not exported`)
  for (const file of ["code.tsx", "copy-button.tsx", "card.tsx", "separator.tsx", "picture-frame.tsx"]) assert.ok(!publicComponents.some((path) => path.endsWith(`/components/${file}`)), file)
})

test("one component per use case for settings and choices: the previews, the vibration switch, the source list and PeriodPicker are not exported", () => {
  for (const file of ["period-picker.tsx", "theme-sample.tsx", "effects-preview.tsx", "tilt-preview.tsx", "haptics-setting.tsx", "source-list.tsx"]) assert.ok(!publicComponents.some((path) => path.endsWith(`/components/${file}`)), file)
})

test("ChoiceCards is words only: the theme, effects and tilt with pictures are AppearanceSettings and its choices", () => {
  const cards = read("components/choice-cards.tsx")
  assert.doesNotMatch(cards, /\b(?:preview|layout)\??:/)
})

test("Picture takes what the picture is (kind) and where it stands (context), never a shape", () => {
  const picture = read("components/picture.tsx")
  const start = picture.indexOf("export function Picture")
  assert.doesNotMatch(picture.slice(start, picture.indexOf(") {", start)), /\b(?:ratio|corners|size|disc)\??:/)
})

test("B. one List: Rows, PictureRows, RankedRows and the other list components are gone, and List takes data, not a look", () => {
  const gone = ["rows", "picture-rows", "ranked-rows", "entity-rows", "virtual-rows", "entry-list", "headline-list", "story-list", "fold-list", "dated-link-table", "picture-card", "item-link", "card-link"]
  for (const file of gone) assert.ok(!publicComponents.some((path) => path.endsWith(`/components/${file}.tsx`)), `${file}.tsx is gone: use List`)
  const types = read("rules/types.tsx")
  for (const rule of ["List row title is a string", "List has no `lead`", "List has no `ratio`", "Tiles has no `ratio`"]) assert.ok(types.includes(`@ts-expect-error: ${rule}`), rule)
  for (const [file, name] of [["list", "List"], ["tiles", "Tiles"]] as const) {
    const source = read(`components/${file}.tsx`)
    const start = source.indexOf(`export function ${name}(`)
    assert.doesNotMatch(source.slice(start, source.indexOf(") {", start)), /\b(?:lead|ratio|corners|look|stretched|size)\??:/, `${name} takes no look`)
  }
  const list = read("components/list.tsx")
  assert.match(list, /\n {2}title: string\n/, "a List row's title is words")
})

test("2. EmptyState is never an error: its words, and every description given to it, never say «Kunne ikke» or «Fikk ikke»", () => {
  const failure = /Kunne ikke|Fikk ikke/i
  assert.doesNotMatch(read("components/empty-state.tsx"), failure, "a failure is an ErrorMessage")
  const stories = join(src, "../stories")
  const files = readdirSync(stories, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile() && /\.(?:tsx|mdx)$/.test(entry.name)).map((entry) => relative(stories, join(entry.parentPath, entry.name)))
  const found = files.filter((name) => [...readFileSync(join(stories, name), "utf8").matchAll(/<EmptyState\b[^>]*>/g)].some(([tag]) => failure.test(tag)))
  assert.deepEqual(found, [], "a story shows a failure as an EmptyState: use ErrorMessage")
  assert.match(read("components/error-message.tsx"), /`Kunne ikke hente \$\{what\}`/, "ErrorMessage says «Kunne ikke hente {what}»")
})

test("2b. the action of an EmptyState follows its reason, and links, buttons and banners take no look (src/rules/types.tsx)", () => {
  const types = read("rules/types.tsx")
  for (const rule of ["first-run requires `action`", "first-run requires `description`", "all-done has no `action`", "EmptyState has no `title`", "EmptyState has no `icon`", "`query` is only for no-results", "ErrorMessage has no children", "LinkButton has no `variant`", "TextLink has no `stretched`", "Button has no `variant`", "Banner has no `warning`"]) {
    assert.ok(types.includes(`@ts-expect-error: ${rule}`), rule)
  }
})

test("2c. ExternalLink, SegmentedToggle, CountUp, DataCell, NumberCell, SortHeader and Pagination are deleted; CommandButton is internal", () => {
  for (const file of ["external-link.tsx", "segmented-toggle.tsx", "count-up.tsx", "data-cell.tsx", "number-cell.tsx", "sort-header.tsx", "pagination.tsx", "command-button.tsx"]) {
    assert.ok(!publicComponents.some((path) => path.endsWith(`/components/${file}`)), file)
  }
  const exports: Record<string, string | null> = JSON.parse(readFileSync(join(src, "../package.json"), "utf8")).exports
  assert.equal(exports["./components/button"], undefined, "`./components/button` is the public `Button`, not `ui/button`")
})

/** The charts that stand in a `ChartCard`; `Sparkline` (in a row), `Meteogram` and `DurationBars` (domain screens) do not. */
const IN_CARD = ["ColumnChart", "AreaChart", "DumbbellChart", "CalendarHeatmap", "AuroraChart"] as const

const storyFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return entry.name === "__screenshots__" ? [] : storyFiles(path)
    return /\.(?:tsx|mdx)$/.test(entry.name) ? [path] : []
  })

test("3. a chart stands only in a ChartCard (a scan of the stories and the components)", () => {
  const count = (text: string, pattern: RegExp): number => text.match(pattern)?.length ?? 0
  const astray: string[] = []
  for (const file of [...storyFiles(join(src, "../stories")), ...publicComponents]) {
    const text = readFileSync(file, "utf8")
    // A story file whose stories are all drawn in a card: the meta's decorator wraps every story, its own render too.
    const decorated = /decorators:\s*\[\(Story\) => <ChartCard\b/.test(text)
    const component = /^\s+component: (\w+),/m.exec(text)?.[1] ?? ""
    if (IN_CARD.some((chart) => chart === component) && !decorated) astray.push(`${relative(src, file)}: the stories of ${component} need the ChartCard decorator`)
    if (decorated) continue
    for (const match of text.matchAll(new RegExp(`<(?:${IN_CARD.join("|")})\\b`, "g"))) {
      const before = text.slice(0, match.index)
      if (count(before, /<ChartCard\b/g) <= count(before, /<\/ChartCard>/g)) astray.push(`${relative(src, file)}: ${match[0]} outside a ChartCard`)
    }
  }
  assert.deepEqual(astray, [], "a chart stands in a ChartCard: its title, its empty state, its height and its table are the card's (README, «Which component»)")
})

test("D. one detail page: DetailLayout has fixed slots and no position, its facts are untitled, and the map, Split and LinkList are not the app's", () => {
  const types = read("rules/types.tsx")
  for (const rule of ["DetailHeader has no `ratio`", "DetailHeader has no `size`", "DetailHeader's `kind` is a PictureKind, not words", "DetailLayout has no `position`", "DetailLayout's map is data, not a component"]) assert.ok(types.includes(`@ts-expect-error: ${rule}`), rule)
  for (const file of ["map-thumb.tsx", "split.tsx"]) assert.ok(!publicComponents.some((path) => path.endsWith(`/components/${file}`)), `${file} is internal or gone`)
  assert.doesNotMatch(read("components/fact-list.tsx"), /export function LinkList\b/, "links out are DetailLayout `links`")
  const layout = read("components/detail-layout.tsx")
  for (const slot of ["status", "steps", "actions", "facts", "links", "map", "updated", "children"]) assert.match(layout, new RegExp(`\\n  ${slot}\\??: `), `DetailLayout has the slot \`${slot}\``)
  assert.doesNotMatch(layout, /PageSection|Heading|"Fakta"\s*>/, "the rail's facts have no title of their own")
  const header = read("components/detail-header.tsx")
  assert.match(header, /shapeOf\(kind, "hero"\)/, "the head's picture takes the shape of its kind")
  assert.match(read("components/stage.tsx"), /Tag === "header" && "border border-border"/, "a page's head has a hairline frame, so a white picture's head is seen")
})

test("long titles: a row's title is cut at two lines and its meta at one, a head's title is never cut, and nothing with text widens the page", () => {
  const steps = read("lib/long-titles.ts")
  assert.match(steps, /ROW_TITLE = "line-clamp-2 min-w-0 \[overflow-wrap:anywhere\]"/)
  assert.match(steps, /ROW_META = "block min-w-0 truncate"/)
  assert.match(steps, /HEAD_TITLE = "min-w-0 text-balance hyphens-auto \[overflow-wrap:anywhere\]"/)
  // A row, a tile, the compact player and a chapter: two lines at most, a long word broken.
  const rows: Record<string, RegExp> = {
    "components/list.tsx": /className=\{ROW_TITLE\}[\s\S]*className=\{ROW_META\}/,
    "components/tiles.tsx": /line-clamp-2[^"]*\[overflow-wrap:anywhere\][^"]*">\{tile\.title\}/,
    "components/podcast-player.tsx": /line-clamp-2[^"]*\[overflow-wrap:anywhere\]">\{episode\.title\}/,
    "components/chapter-list.tsx": /line-clamp-2 min-w-0[^"]*\[overflow-wrap:anywhere\]">\{chapter\.title\}/,
    "components/sub-pages.tsx": /line-clamp-2[^"]*\[overflow-wrap:anywhere\]">\{page\.label\}/,
    "components/departure-list.tsx": /line-clamp-2 font-medium \[overflow-wrap:anywhere\]/,
  }
  for (const [file, pattern] of Object.entries(rows)) assert.match(read(file), pattern, `${file}: a row's title is cut at two lines`)
  // A head: never cut, a step smaller when long.
  const text = read("components/text.tsx")
  assert.match(text, /page: `[^`]*\$\{HEAD_TITLE\}`/, "a page's title wraps, hyphenates and breaks")
  assert.match(text, /titleStep\(children\)/, "a page's title is set smaller when it is long")
  const dialog = read("components/now-playing.tsx")
  assert.match(dialog, /<h2 id=\{title\} className=\{`\$\{HEAD_TITLE\}[^`]*titleStep\(episode\.title\)/, "«Spilles nå»'s title is whole and smaller when long")
  for (const file of ["components/page-header.tsx", "components/detail-header.tsx", "components/now-playing.tsx", "components/now-playing-card.tsx"]) assert.doesNotMatch(read(file), /line-clamp-\d[^"]*">\s*\{?(episode\.)?title\}?/, `${file}: a head's title is never cut`)
  for (const file of ["components/podcast-player.tsx", "components/now-playing.tsx"]) assert.doesNotMatch(read(file), /marquee/i, "no marquee: a title is cut, never scrolled")
  // What sits beside a title keeps its size; the title's own box can shrink.
  assert.match(read("components/page-header.tsx"), /min-w-0 flex-\[1_1_14rem\][\s\S]*shrink-0/, "a page's actions keep their size beside its title")
  assert.match(read("components/breadcrumbs.tsx"), /max-w-\[16ch\][\s\S]*min-w-0 truncate/, "the middle crumbs are cut")
  for (const file of publicComponents) {
    const source = readFileSync(file, "utf8")
    // `truncate` and `line-clamp` cut only an element that may shrink: every one of them stands in, or is, a `min-w-0` box.
    if (/\b(truncate|line-clamp-\d)\b/.test(source)) assert.match(source, /\bmin-w-0\b/, `${file}: what is cut must be allowed to shrink (min-w-0)`)
  }
})

test("no heading is set in capitals: no heading look, heading element or section title has `uppercase`", () => {
  const found = [...publicComponents, join(src, "components", "internal", "section-title.tsx")].flatMap((path) => {
    const text = readFileSync(path, "utf8")
    const headings = text.match(/<h[1-6]\b[^>]*>/g) ?? []
    const looks = text.match(/const HEADINGS = \{[\s\S]*?\n\} as const/)?.[0] ?? ""
    const skeleton = path.endsWith("section-skeleton.tsx") ? text : ""
    return [...headings, looks, skeleton].some((part) => /\buppercase\b/.test(part)) ? [relative(src, path)] : []
  })
  assert.deepEqual(found, [])
})
