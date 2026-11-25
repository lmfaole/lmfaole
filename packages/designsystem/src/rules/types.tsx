/**
 * Type rules of 10.0.0 that `tsc` checks (`npm run typecheck`): each `@ts-expect-error` is a call an app must not be able to write.
 * If a rule is loosened, its line compiles, the directive is unused, and the type-check fails. `rules.test.ts` holds this file to them.
 */
import { PageSection } from "../components/page-section"
import { Stack } from "../components/layout"
import { List } from "../components/list"
import { Tiles } from "../components/tiles"
import { Banner } from "../components/banner"
import { DetailHeader } from "../components/detail-header"
import { DetailLayout } from "../components/detail-layout"
import { Button } from "../components/button"
import { EmptyState } from "../components/empty-state"
import { ErrorMessage } from "../components/error-message"
import { LinkButton } from "../components/link-button"
import { Text, TextLink } from "../components/text"

export const RULES = [
  // 1. A section always has an icon.
  // @ts-expect-error: PageSection requires `icon`
  <PageSection key="icon" id="a" title="Uten ikon">innhold</PageSection>,
  // Text takes a role, never a size or a tone.
  // @ts-expect-error: Text has no `size`
  <Text key="size" size="sm">tekst</Text>,
  // @ts-expect-error: Text has no `tone`
  <Text key="tone" tone="muted">tekst</Text>,
  // Stack has two gaps.
  // @ts-expect-error: Stack has no `xl`
  <Stack key="gap" gap="xl">innhold</Stack>,
  // B. A list's rows are data: the title is words, the lead follows from `kind`, and there is no look to choose.
  // @ts-expect-error: List row title is a string
  <List key="title" rows={[{ key: "a", title: <a href="/a">A</a> }]} />,
  // @ts-expect-error: List has no `lead`
  <List key="lead" lead="poster" rows={[{ key: "a", title: "A" }]} />,
  // @ts-expect-error: List has no `ratio`
  <List key="ratio" ratio="square" rows={[{ key: "a", title: "A" }]} />,
  // @ts-expect-error: Tiles has no `ratio`
  <Tiles key="tiles" ratio="poster" kind="film" tiles={[{ key: "a", title: "A" }]} />,
  // 2. An empty state says why, and its action follows: required for a first run, none when all is done.
  // @ts-expect-error: first-run requires `action`
  <EmptyState key="first-action" reason="first-run" what="podkaster" description="Finn podkaster du liker." />,
  // @ts-expect-error: first-run requires `description`
  <EmptyState key="first-description" reason="first-run" what="podkaster" action={{ href: "/finn", label: "Finn podkaster" }} />,
  // @ts-expect-error: all-done has no `action`
  <EmptyState key="done-action" reason="all-done" what="pull requests" action={{ href: "/", label: "Til forsiden" }} />,
  // @ts-expect-error: EmptyState has no `title`
  <EmptyState key="title" reason="nothing-yet" what="episoder" title="Ingen episoder" />,
  // @ts-expect-error: EmptyState has no `icon`
  <EmptyState key="icon" reason="nothing-yet" what="episoder" icon="podcast" />,
  // @ts-expect-error: `query` is only for no-results
  <EmptyState key="query" reason="nothing-yet" what="episoder" query="radio" />,
  // A failure says what could not be fetched; the words are the design system's.
  // @ts-expect-error: ErrorMessage has no children
  <ErrorMessage key="children" what="været" error={new Error("503")}>Kunne ikke hente været</ErrorMessage>,
  // Links and buttons take what they do, never a look.
  // @ts-expect-error: LinkButton has no `variant`
  <LinkButton key="variant" href="/" variant="default">Til forsiden</LinkButton>,
  // @ts-expect-error: TextLink has no `stretched`
  <TextLink key="stretched" href="/" stretched>Til forsiden</TextLink>,
  // @ts-expect-error: Button has no `variant`
  <Button key="button-variant" variant="ghost">Avbryt</Button>,
  // A banner is never a failure.
  // @ts-expect-error: Banner has no `warning`
  <Banner key="warning" tone="warning" title="Data kan være gamle" />,
  // D. A detail page's head says what the thing is, and its shape follows; its body has one rail in one place.
  // @ts-expect-error: DetailHeader has no `ratio`
  <DetailHeader key="ratio" kind="film" label="Film" title="Heat" ratio="poster" />,
  // @ts-expect-error: DetailHeader has no `size`
  <DetailHeader key="size" kind="artist" label="Artist" title="Röyksopp" size="large" />,
  // @ts-expect-error: DetailHeader's `kind` is a PictureKind, not words
  <DetailHeader key="kind" kind="Film · 1995" label="Film" title="Heat" />,
  // @ts-expect-error: DetailLayout has no `position`
  <DetailLayout key="position" position="end">innhold</DetailLayout>,
  // @ts-expect-error: DetailLayout's map is data, not a component
  <DetailLayout key="media" media={<span />}>innhold</DetailLayout>,
]
