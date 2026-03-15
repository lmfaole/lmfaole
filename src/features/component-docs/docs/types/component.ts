import type React from "react";
import type { PropDef } from "./prop";
import type { ComponentExample } from "./example";
import type { Migration } from "./migration";
import type { ComponentId } from "./ids";

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

    /** Props accepted by this sub-component. Each entry follows the {@link PropDef} shape. */
    props: PropDef[];
}

/**
 * Complete documentation record for a single Jøkul component.
 * One file per component under `src/features/component-docs/docs/`.
 */
export interface ComponentDoc {
    /**
     * Unique kebab-case identifier matching the URL segment, e.g. `"text-input"`.
     * Must be a registered value in {@link ComponentId} — add it to `types/ids.ts`
     * when creating a new component doc.
     */
    id: ComponentId;

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
     * Set to `false` for components that are subcomponents of another and should
     * not appear as standalone entries in the component overview.
     * Defaults to `true`.
     */
    standalone?: false;

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
     *
     * **Always use a stateful preview — never static JSX.**
     * Define a local function component above `const doc` that uses `useState`/`useEffect`
     * and `usePreviewHovered` to animate or interact when the card is hovered.
     * A static preview fails to communicate what the component _does_.
     *
     * @example
     * ```tsx
     * function MyPreview() {
     *     const isHovered = usePreviewHovered();
     *     const [checked, setChecked] = useState(false);
     *     useEffect(() => { setChecked(isHovered); }, [isHovered]);
     *     return <MyComponent checked={checked} onChange={e => setChecked(e.target.checked)} />;
     * }
     *
     * const doc: ComponentDoc = {
     *     // ...
     *     preview: <MyPreview />,
     * };
     * ```
     */
    preview: React.ReactNode;

    /**
     * Props accepted directly on the root component element.
     * Each entry follows the {@link PropDef} shape.
     * List all non-trivial props. Native HTML attribute pass-throughs (e.g. `className`,
     * `id`, `aria-*`) only need to be listed if they have special behaviour in this component.
     */
    props: PropDef[];

    /**
     * Compound sub-components exported as properties of the root, e.g. `Popover.Trigger`.
     * Each entry follows the {@link SubComponentDoc} shape.
     * Omit for simple components with no sub-component API.
     */
    subComponents?: SubComponentDoc[];

    /**
     * Usage examples ordered from simplest to most advanced.
     * Each entry follows the {@link ComponentExample} shape.
     * The first example should always show the most common real-world usage.
     * Include at least one example; aim for 3–5.
     */
    examples: ComponentExample[];

    /**
     * API migration guides for deprecated props or components.
     * Each entry follows the {@link Migration} shape and is self-contained with before/after code.
     * Rendered in a dedicated "Migrering" section on the component page.
     * Omit for components with no deprecated APIs.
     */
    migrations?: Migration[];

    relationships?: ComponentRelationships;
}

/**
 * A single relationship entry — an ID plus a human-readable description
 * of why/how the two components relate.
 */
export interface ComponentRelationship {
    id: ComponentId;
    /** One sentence describing the relationship, e.g. "Use CheckboxPanel when you need a larger click target with an embedded label." */
    description: string;
}

/**
 * Relationships to other components, grouped by kind.
 *
 * ## Choosing the right bucket
 *
 * | Field           | Question to ask                                              | Example                          |
 * |-----------------|--------------------------------------------------------------|----------------------------------|
 * | `alternatives`  | "Could the user pick THIS instead of the current component?" | Checkbox → CheckboxPanel         |
 * | `subcomponents` | "Is this a named child that lives INSIDE the current one?"   | Card → CardImage, Tabs → TabList |
 * | `related`       | "Is this commonly used ALONGSIDE the current component?"     | TextInput → Label, Help          |
 *
 * A component that is a **subcomponent** of another should NEVER appear in `alternatives`.
 * It should also have `standalone: false` on its own doc so it is hidden from the overview.
 */
export interface ComponentRelationships {
    /**
     * Other components the user could choose instead of this one to solve the same problem.
     * These must be independent, top-level components — never a child/subcomponent.
     *
     * @example Checkbox → CheckboxPanel, Select → Combobox
     */
    alternatives?: ComponentRelationship[];

    /**
     * Named child components that are part of this component's API and render *inside* it.
     * They are not interchangeable alternatives — they extend or compose this component.
     * Any component listed here should also have `standalone: false` on its own doc.
     *
     * @example Card → CardImage, Tabs → TabList, Popover → Popover.Trigger
     */
    subcomponents?: ComponentRelationship[];

    /**
     * Independent components that are frequently used alongside this one,
     * or that this component is typically embedded within.
     *
     * @example TextInput → Label, CheckboxPanel → Checkbox
     */
    related?: ComponentRelationship[];
}
