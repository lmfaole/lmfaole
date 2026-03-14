import type React from "react";
import type { PropDef } from "./prop";
import type { ComponentExample } from "./example";
import type { Migration } from "./migration";

/**
 * Documentation for a compound sub-component such as `Popover.Trigger` or `Tabs.TabPanel`.
 * Sub-components are rendered in a dedicated section below the root component's prop table.
 */
export interface SubComponentDoc {
    /**
     * Full dot-notation name as used in JSX, e.g. `"Popover.Content"` or `"Tabs.TabList"`.
     * Must match the exported name exactly.
     */
    name: string;

    /**
     * One or two sentences describing what this sub-component does and how it relates
     * to the parent. Omit only if the name is entirely self-explanatory.
     */
    description?: string;

    /** Props accepted by this sub-component. Follow the same rules as {@link PropDef}. */
    props: PropDef[];
}

/**
 * Complete documentation record for a single Jøkul component.
 * One file per component under `src/features/component-docs/docs/`.
 */
export interface ComponentDoc {
    /**
     * Unique kebab-case identifier matching the file name and URL segment,
     * e.g. `"text-input"`, `"expandable-panel"`.
     */
    id: string;

    /**
     * Human-readable display name with normal casing and spaces,
     * e.g. `"Text Input"`, `"Expandable Panel"`.
     * This is shown in cards, headings and the site header dropdown.
     */
    name: string;

    /**
     * The npm package path used to import the component,
     * e.g. `"@fremtind/jokul/text-input"`.
     */
    package: string;

    /**
     * Primary navigation category that determines where the component appears
     * in the site header dropdown and the component listing page.
     *
     * - `"Skjema"`         — Form inputs (TextInput, Select, Checkbox, …)
     * - `"Handling"`       — Action triggers (Button, Chip, Toggle Switch, …)
     * - `"Visning"`        — Content display (Card, Table, Tag, Icon, …)
     * - `"Navigasjon"`     — Navigation (Breadcrumb, Link, Tabs, Pagination, …)
     * - `"Overlegg"`       — Floating/overlay elements (Modal, Popover, Tooltip, Toast, …)
     * - `"Tilbakemelding"` — Status and feedback (Message, Loader, Skeleton, …)
     * - `"Layout"`         — Structural and utility (Flex, Screen Reader Only)
     */
    category: "Layout" | "Skjema" | "Handling" | "Tilbakemelding" | "Navigasjon" | "Visning" | "Overlegg";

    /**
     * Lifecycle status of the component as a whole.
     * Omit for stable components to keep the UI clean.
     *
     * - `"stable"`     — Default. Production-ready.
     * - `"beta"`       — Functional but API may change.
     * - `"deprecated"` — Will be removed. Add a migration note in `warnings`.
     */
    status?: "stable" | "beta" | "deprecated";

    /**
     * Lowercase search/filter keywords, e.g. `["dropdown", "select", "form"]`.
     * Include synonyms and related concepts users might search for.
     * Do not repeat the component name — it is already indexed.
     */
    tags: string[];

    /**
     * One or two sentences describing what the component is and when to use it.
     * Should answer: "What problem does this solve?"
     * Avoid restating the component name.
     */
    description: string;

    /**
     * Important caveats, gotchas or usage constraints surfaced prominently in the UI.
     * Use a single string for one warning, or an array for multiple.
     * Examples: accessibility requirements, known browser quirks, required peer components.
     */
    warnings?: string | string[];

    /**
     * Live React element shown in the component card on the listing page and
     * in the page header. Should be compact (fits ~200×120px) and visually representative.
     * Falls back to `examples[0].preview` when omitted.
     */
    preview?: React.ReactNode;

    /**
     * Props accepted directly on the root component element.
     * List all non-trivial props. Native HTML attribute pass-throughs (e.g. `className`,
     * `id`, `aria-*`) only need to be listed if they have special behaviour in this component.
     */
    props: PropDef[];

    /**
     * Compound sub-components exported as properties of the root, e.g. `Popover.Trigger`.
     * Omit for simple components with no sub-component API.
     */
    subComponents?: SubComponentDoc[];

    /**
     * Usage examples ordered from simplest to most advanced.
     * The first example should always show the most common real-world usage.
     * Include at least one example; aim for 3–5.
     */
    examples: ComponentExample[];

    /**
     * API migration guides for deprecated props or components.
     * Each entry is self-contained with before/after code and optional live preview.
     * Rendered in a dedicated "Migrering" section on the component page.
     * Omit for components with no deprecated APIs.
     */
    migrations?: Migration[];

    /**
     * IDs of related components worth exploring after this one,
     * e.g. `["modal", "tooltip"]` on the Popover page.
     * Used to render a "Se også" section at the bottom of the page.
     */
    relatedIds?: string[];
}
