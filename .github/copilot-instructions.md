# Copilot Instructions

This project is a documentation site for **Jøkul** — Fremtind's design system. All component documentation must follow
the rules below precisely.

---

## General Development Principles

Always prioritize **progressive enhancement**, **modern CSS functionality**, **accessible code**, and **native browser
functions**. Avoid "hacky" workarounds when a cleaner, more standard approach exists.

- **Progressive Enhancement** — Ensure core functionality works for everyone, then enhance with modern features.
- **Modern CSS** — Use modern CSS features (e.g., `:has()`, `grid`, `aspect-ratio`) instead of JavaScript-heavy layout
  logic.
- **Accessibility (a11y)** — Use semantic HTML and follow ARIA best practices. Ensure keyboard navigability and screen
  reader support.
- **Native Functions** — Prefer native Web APIs (e.g., `<dialog>` element, `Intl`, `fetch`) over third-party libraries
  or custom re-implementations.

---

## Component docs (`src/features/component-docs/docs/`)

Each component lives in its own folder and exports a `ComponentDoc` object (default export from `index.tsx`) and a
`PropDef[]` array (named export from `props.ts`).

### `ComponentDoc` rules

Defined in `src/features/component-docs/docs/types/component.ts`. Key rules:

- **`id`** — kebab-case, must be registered in `types/ids.ts`.
- **`name`** — human-readable, e.g. `"Text Input"`.
- **`package`** — exact npm import path, e.g. `"@fremtind/jokul/text-input"`.
- **`category`** — one of:
  `"Layout" | "Skjema" | "Handling" | "Tilbakemelding" | "Navigasjon" | "Visning" | "Overlegg"`.
- **`description`** — 1–2 sentences answering "What problem does this solve?". Never restate the component name.
- **`warnings`** — important gotchas only. Omit if none.
- **`preview`** — **required on every `ComponentDoc`, including subcomponents (`standalone: false`)**. Must always be a
  stateful function component — never static inline JSX and never `null as any` (see [Preview rules](#preview-rules)).
- **`props`** — import from `./props`. See [PropDef rules](#propdef-rules).
- **`examples`** — import from `./examples`. At least one; simplest use case first.
- **`migrations`** — only when deprecated APIs exist.
- **`relationships`** — use `alternatives`, `subcomponents`, `related` buckets. See JSDoc for which bucket to use.

### Preview rules

`preview` **must always be a stateful function component** defined above `const doc`. Never use static JSX directly in
the field. **Never use `null as any`** — even for subcomponents (`standalone: false`). Subcomponent previews should show
the subcomponent rendered inside its parent context.

```tsx
// ✅ Correct — subcomponent shown in parent context
export function TabPreview() { return <TabsPreview />; }

// ❌ Wrong — null is not a valid preview
const doc: ComponentDoc = {
    preview: null as any,
};
```

```tsx
// ✅ Correct
function MyComponentPreview() {
    const isHovered = usePreviewHovered();
    const [checked, setChecked] = useState(false);
    useEffect(() => { setChecked(isHovered); }, [isHovered]);
    return <MyComponent checked={checked} onChange={e => setChecked(e.target.checked)} />;
}

const doc: ComponentDoc = {
    preview: <MyComponentPreview />,
    // ...
};

// ❌ Wrong — static, no interaction
const doc: ComponentDoc = {
    preview: <MyComponent defaultChecked />,
};
```

- Always import `usePreviewHovered` from `@/features/component-docs/components/PreviewHoverContext`.
- Use `useEffect(() => { ... }, [isHovered])` to react to hover state.
- Keep the preview compact — it renders at roughly 200×120 px.
- Animate something meaningful on hover: toggle state, cycle variants, animate progress, type text, etc.

---

### `PropDef` rules

Defined in `src/features/component-docs/docs/types/prop.ts`. Every non-trivial prop must be documented.

```ts
{
    name: "labelProps",                         // exact JSX prop name
    type: 'Omit<LabelProps, "children">',       // TypeScript type as a string
    required: false,
    default: undefined,                         // omit if required or no meaningful default
    description: "One to three sentences.",     // what it does and when to use it
    source: "custom",                           // "custom" | "native" | "aria" | "react"
    status: "stable",                           // "stable" | "experimental" | "deprecated"
    statusDescription: "...",                   // required when status is "deprecated" or "experimental"
}
```

**`source` values:**

- `"custom"` — Jøkul-specific prop (e.g. `variant`, `errorLabel`, `labelProps`)
- `"native"` — HTML attribute forwarded to DOM (e.g. `disabled`, `placeholder`)
- `"aria"` — ARIA attribute (e.g. `aria-label`, `role`)
- `"react"` — React prop (e.g. `children`, `onChange`, `ref`)

**`labelProps` must be documented on every Jøkul form component that supports it.** The prop is
`Omit<LabelProps, "children">` (or with additional omissions per component — check the component's type definition). The
description must mention that `srOnly: false` makes the label visually visible (labels are hidden by default on some
components like `Search`).

---

### `ComponentExample` rules

Defined in `src/features/component-docs/docs/types/example.ts`.

- `title` — short heading, e.g. `"Med feilmelding"`.
- `code` — valid JSX, no imports, 4-space indentation.
- `preview` — live React element; keep side-effect-free.
- Order examples from simplest → most advanced.
- First example must show the most common real-world usage.

---

### `Migration` rules

Defined in `src/features/component-docs/docs/types/migration.ts`.

- One `Migration` per deprecated API. Never combine unrelated deprecations.
- `description` — explains *why* it was deprecated (the *how* is in `before`/`after`).
- `before` / `after` — valid JSX, no imports, 4-space indentation.
- `replacedBy` — omit entirely if the deprecated item has no replacement.

---

## Using Jøkul components

Always check the component's TypeScript definitions before using it:

```
node_modules/@fremtind/jokul/build/es/components/<component>/types.d.ts
```

- Import from `@fremtind/jokul/<component>`, e.g. `import { Search } from "@fremtind/jokul/search"`.
- Only use props that exist in the type definitions — do not guess or invent props.
- `labelProps` on form components defaults to `srOnly: true` on some components (e.g. `Search`). Pass
  `labelProps={{ srOnly: false }}` to make the label visually visible.

---

## Styling rules

**Never override Jøkul component styles.** Jøkul components are self-contained — their visual design is intentional and
must not be altered.

```tsx
// ❌ Never — overriding Jøkul internals
<Button style={{ borderRadius: "0", background: "red" }} />
<Button className="my-custom-button-override" />

// ❌ Never — targeting Jøkul CSS classes in your own stylesheets
.jkl-button { font-size: 14px; }
.jkl-text-input__input { border-color: blue; }

// ✅ Correct — use layout wrappers for positioning/spacing
<div className="my-layout">
    <Button>Send inn</Button>
</div>

// ✅ Correct — use Jøkul design tokens for your own elements
<div style={{ gap: "var(--jkl-spacing-m)", color: "var(--jkl-color-text-default)" }}>
```

**Rules:**

- Do not pass `style` or `className` to a Jøkul component to change its appearance.
- Do not write CSS that targets Jøkul class names (`.jkl-*`).
- Use Jøkul design tokens (`var(--jkl-*)`) in your own custom elements to stay visually consistent.
- Spacing, sizing, and positioning of the surrounding layout is fine — wrap components in your own elements for that.
- If a visual need cannot be met with the existing Jøkul API, discuss it as a design system contribution rather than a
  local override.

---

## `TabPanel` and `NavTabs` content wrapping

**Always wrap `TabPanel` content in a `<Card padding="l">`** to ensure consistent alignment, padding and visual
containment. The same rule applies to the content area that appears directly below a `<NavTabs>` bar — since NavTabs and
Tabs are visually identical, their content areas must be treated the same way.

**Use the default `<Card>` (no `variant` prop)** for tab panel content. **The tab bar and its content must always be
positioned directly adjacent — no spacing between them.** Do not place them inside a `<Flex gap="...">` or any other
container that adds space between the tab bar and the panel. The visual connection between the active tab indicator and
the card beneath it depends on zero gap.

```tsx
import {Card} from "@fremtind/jokul/card";

// ❌ Never — bare content, and gap between tabs and panel
<Flex gap="l">
    <TabList>...</TabList>
    <TabPanel><p>Innhold her.</p></TabPanel>
</Flex>

// ❌ Never — gap between NavTabs and content
<Flex direction="column" gap="xl">
    <NavTabs>...</NavTabs>
    <Card padding="l">...</Card>
</Flex>

// ✅ Correct — Tabs manages its own internal layout, content in Card
<Tabs>
    <TabList>
        <Tab>Oversikt</Tab>
    </TabList>
    <TabPanel>
        <Card padding="l">
            <p>Innhold her.</p>
        </Card>
    </TabPanel>
</Tabs>

// ✅ Correct — NavTabs and its Card sibling with no gap between them
<Flex direction="column" gap="xl">
    <PageHeader ... />
    <div>
        <NavTabs aria-label="Vis">
            <NavTab href="/oversikt" aria-selected>Oversikt</NavTab>
            <NavTab href="/detaljer">Detaljer</NavTab>
        </NavTabs>
        <Card padding="l">
            {/* page content */}
        </Card>
    </div>
</Flex>
```

This rule applies everywhere — in pages, features and component examples (both `preview` and `code` strings).

---



**Always use the `Flex` component for flex layouts** — never write `display: flex` in inline styles or CSS.

```tsx
import { Flex } from "@fremtind/jokul/flex";

// ❌ Never — manual flexbox
<div style={{ display: "flex", gap: "var(--jkl-spacing-m)", alignItems: "center" }}>

// ❌ Never — flexbox in CSS/SCSS
.my-layout { display: flex; gap: 16px; }

// ✅ Correct — use the Flex component
<Flex gap="m" alignItems="center">
    <Button>Send inn</Button>
    <Link href="#">Avbryt</Link>
</Flex>
```

**`Flex` props:** `direction`, `gap`, `wrap`, `alignItems`, `justifyContent`, `inline`. See the Flex component docs or
type definitions for the full API.

The only exception is `display: inline-flex` on a non-Jøkul element where wrapping in `<Flex inline>` would be
semantically wrong (e.g. a `<span>` that must remain inline).

---

## Updating Jøkul

When `@fremtind/jokul` is upgraded to a new version, **always audit and update the component docs** to reflect the
changes before committing:

1. **Check the changelog** — read the release notes for the new version and identify added props, removed props, renamed
   APIs, new components, and deprecations.
2. **Update `props` arrays** — add new props, mark deprecated props with `status: "deprecated"`, remove props that no
   longer exist.
3. **Update `warnings`** — reflect any new gotchas or removed caveats.
4. **Update `migrations`** — if APIs changed, add a migration entry showing before/after.
5. **Update `relationships`** — if new sub-components were added or components were merged/split.
6. **Update `preview.tsx`** — if component APIs changed, update the preview to use the new API.
7. **Re-check patches** — if a patch fixes a bug that was resolved upstream, remove the patch. If a new bug was
   introduced, add a patch and file an issue.
8. **Run `npx tsc --noEmit`** — verify zero TypeScript errors after the upgrade.

---



When you encounter any of the following while using Jøkul, **always create a GitHub issue** in this repository before or
immediately after applying a workaround:

| Type                         | Eksempel                                             |
|------------------------------|------------------------------------------------------|
| **Bug**                      | Uventet oppførsel, statisk animasjon, feil rendering |
| **Manglende styles**         | Komponent mangler CSS, tema fungerer ikke            |
| **Forvirrende API**          | Props er vanskelige å forstå eller bruke riktig      |
| **Manglende funksjonalitet** | Ønsket prop eller variant finnes ikke                |
| **TypeScript-feil**          | Feil eller manglende typer, `any`-caster nødvendig   |
| **Tilgjengelighetsproblem**  | ARIA, tastaturnavigasjon, skjermleser                |
| **SSR/hydration-problem**    | Krasj eller mismatch i Next.js                       |
| **Ytelsesproblem**           | For mange DOM-noder, tunge animasjoner               |
| **Dokumentasjonsmangel**     | Feil eller manglende docs i Jøkul                    |

Rules:

- **Write the issue in Norwegian** — title and body
- **Be concise** — one short sentence per section, no unnecessary context
- Always use `--body-file /tmp/issue.md` (not `--body`) to avoid CLI hangs with multiline content

```
gh issue create \
  --repo lmfaole/lmfaole \
  --title "Jøkul-<type>: <Komponent> – <Kort beskrivelse>" \
  --body-file /tmp/issue.md
```

Where `<type>` matches the table above, e.g. `Jøkul-bug`, `Jøkul-API`, `Jøkul-a11y`, `Jøkul-SSR`, `Jøkul-ytelse`,
`Jøkul-docs`.

**Bug / manglende styles** body:

```
## Hva skjer
<Én setning>

## Hvorfor
<Én setning>

## Hva som burde skje
<Én setning>

## Fiks
<Én setning>
```

**Forvirrende API / manglende funksjonalitet / TypeScript** body:

```
## Problem
<Hva som er vanskelig, mangler eller er feil>

## Eksempel
<Kort kodeeksempel eller beskrivelse av forvirringen>

## Forslag
<Hva som kunne gjort det enklere>
```

**Tilgjengelighet / SSR / ytelse** body:

```
## Problem
<Hva som ikke fungerer>

## Kontekst
<Komponent, rammeverk, reproduksjonssteg>

## Forslag
<Mulig fiks eller workaround>
```
