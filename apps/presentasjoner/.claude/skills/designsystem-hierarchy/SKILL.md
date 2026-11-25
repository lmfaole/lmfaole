---
name: designsystem-hierarchy
description: Use when laying out a page or a list with the design system, or deciding the order, grouping, emphasis and width of what a person reads - one reading column, order as priority, one thing first, visual hierarchy, spacing as grouping, and when columns are allowed. Use before reaching for Grid or a pane and whenever a page feels busy or unclear.
---

# Reading and hierarchy

The rules are README rule 7 and «Reading and hierarchy», and Storybook **Patterns / Reading and hierarchy**. The principle: **one
reading direction, down.** What is read stands under each other, in one column, in the order it matters.

## 1. One column for everything that is read

- Titles, lists of text, the sections of a page, prose: **under each other**. Put the sections straight in `PageLayout`: it spaces them, the
  same on every page (never a `Stack` around them). They stand in the page's **reading column** (`PageLayout width="reading"`, the default: 48rem, centred).
- **Never** a grid that makes the reader read across and then down. A row of equal columns puts the order in doubt, hides what is
  first, and spreads the eye's work. There is no `Grid columns="sections"`, no list in columns, and no group of sections
  (a part of a part is a page of its own). A test fails if they come back.
- On a wide screen the LINE does not grow: text stays at 45–75 characters (the 48rem column). The width a desktop has goes, in this
  order, to (1) a **pane** beside the main content, when the page has something to look up (a cover and its facts,
  related things): the detail page's rail (DetailLayout, from 10.0.0; who the page is about, or support for it);
  (2) **more across** of what is looked at (pictures, cards, charts) on a `width="wide"` page; (3) otherwise **margin**. Never to
  longer lines, a second list beside the first, or the same content spread thin. See the guide «Wide screens».
- **Columns are for what is looked at, not read:** pictures (`Tiles`), charts (`Grid columns="charts"`), cards of equal weight
  (`ChartCard`), a few figures or chips (`SummaryBar`), and the rail of *reference* of a detail page (a cover and its facts)
  beside the main content. A page that is mostly such things is `width="wide"`.
- Ask before you use `Grid` or a pane: «is this read, or looked at?» If read, stack it.
- **A part takes the layout of the room it has, not of the screen:** a card or a pane changes by its container's width (container
  queries in the components), so the same part is right in the column, the rail and a pane. Type does not grow with the window.
- **Density comes from more rows, not more columns.** A list on a wide screen is the same list, as compact (one line a row, the name and
  what tells it apart); prose gets the air. Never stretch a row to fill the width, or put two short rows beside each other.

## 2. Order is priority

Top to bottom is most to least important, the same on every screen width. Decide the order **first**, then build it. If two things
matter equally, one still goes first. Put the summary and the few that matter before the long list.

- **Whatever stands on the first screen reads as important,** so take off what is not: a welcome text, a heading that repeats the
  `NavBar`, a summary of nothing. What the reader came for starts on the first screen of a phone.
- **A long page has landmarks:** every group has its heading, so a reader who scrolls finds their place again (a list by day, by season).
  A page no one can find their way in is a page to split, not to give more emphasis.

## 3. One thing first

The first thing the eye lands on is the one that matters most. Not two. On a front page that is the `SummaryBar`, or the single
section that needs the reader now; on a detail page it is the title and the status.

- **At most two things stand out on a screen** (the title and one figure, or the title and the lit picture). The rest is quiet; when
  everything is bold, nothing is.
- **The chrome is quieter than the content:** `NavBar`, `Breadcrumbs`, the counts beside a place and the source credit recede, so the
  page's own title is the strongest thing on it (Linear's redesign: navigation dimmed, content forward).

## 4. Three levels, visibly different

Page title (`PageHeader`, `Heading level={1}`), section title (`PageSection`, `look="part"`), item (the row's name).
Each differs in size and weight, never in case. **No fourth level of emphasis.** `destructive` and bold are for what stops something.

- **Few steps, far apart:** the three levels and two text colours (the text and `quiet`) carry the whole page; a difference too small to see
  at a glance is noise, not hierarchy (NN/g, visual hierarchy). Never a new size, weight or colour for one place.
- **Headings make the page readable on their own** (the layer-cake way people scan, NN/g): a section title says what is in it
  («Nye episoder fra det du følger»), never only a word like «Mer» or «Diverse».

## 5. Space groups, not lines or boxes

- Things that belong together are close: `Stack gap="tight"`.
- Blocks inside a section: the `Stack` default. **The gap between sections is always larger than the gap inside one**, and it is `PageLayout`'s, not the page's.
- **Three steps of space,** each larger than the one inside it, and all of them the system's: inside an item `tight`, between the blocks of a section `default`, between sections `PageLayout`'s.
- **A heading is closer to its own content than to what is above it.** A section's own gap is the `Stack` default; `tight` only for lines that belong together. The space between sections is `PageLayout`'s.
- **Space first.** A thin line only when a gap does not separate, a box only when a line does not, one of them for one level and never nested. A card is only for one self-contained item (**designsystem-ui**, Cards); one set of facts is a `FactList`.
- **Grouping is one level on a page** (`PageSection`); a part of a part is a page. **Disclosure is two levels:** what is needed, then «Se alle».
- **Room for what matters.** The most important thing has space around it; a dense part is fine, a crowded page is not.
- **A row starts with what tells it apart**, not with what every row repeats (move that into the icon or the section title). A heading starts with its meaning.
- **Front-load:** the first two words of a title, a row, a link or a button carry its meaning, because a scanning eye reads down the left
  and only the start of each line (NN/g, F-pattern). «Hades II er ute», not «Det er nå klart at Hades II …».

## 6. One left edge, a short eye path

- Everything starts at the same left edge; do not centre text or lists inside the column.
- A date or count is at the end of the **same row**, in a row no wider than the reading column, so the eye can cross it.
- Prose is 45–75 characters (`Stack width="prose"`, `max-w-prose`), about 66 at best (Butterick; GOV.UK: no more than 75). Shorter
  than 45 breaks the reading into fragments; longer loses the start of the next line.

## 7. Rows are scanned down the left

Every row of a list starts with the same thing (the kind icon, then the name). The **name is the strongest part**; everything else
is `Text role="quiet"`. All rows of a list have one structure (`List`).

## 8. Several of a kind stack

Several things of one kind (reviewers, labels, assignees) are **under each other**, never `a, b, c` in one line. In a `FactList` they are
several values of one term, which is written once (`["Reviewere", ["zenabii", "Stormoen"]]`). A list is scanned down; a sentence
is read along.

## 9. Do not make the reader choose a path

One column is one path. Do not put two lists side by side to compare (that is a table). Do not hide what fits under behind tabs.

## 10. Check it

1. Look at **400, 768, 1024, 1440 and 2560 px** (compact, medium, expanded, large, extra-large) and at 200 % zoom. At each width the
   reader can read straight down; from 1024 px (about 1150 px with a `NavBar` rail) a detail page's pane is beside the main content, and no line is longer at 2560 than at 1440.
2. Cover all but the first screen: is it clear what matters most?
3. Squint: are the three levels still different? Is anything shouting that should not?
4. Follow the left edge: does it say what every row is?
5. Read only the headings: do they tell what the page holds, in order of what matters?
6. Read only the first two words of each row and title: is each one told apart from the next?

Sources: NN/g (visual hierarchy, F-shaped and layer-cake scanning); Butterick's Practical Typography (line length); GOV.UK Design
System (layout); Linear (how we redesigned the Linear UI); Vercel Geist (typography); Material 3 window size classes.

Before finishing, run **designsystem-review**.
