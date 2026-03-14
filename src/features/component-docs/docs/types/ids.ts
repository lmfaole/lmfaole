/**
 * Exhaustive list of all registered Jøkul component IDs.
 * Each value matches the {@link import("./component").ComponentDoc.id} of exactly one component.
 *
 * Add a new entry here when adding a new component doc.
 * Removing or renaming an entry will produce TypeScript errors at every
 * {@link import("./component").ComponentDoc.relatedIds} reference to that ID.
 */
export const COMPONENT_IDS = [
    "autosuggest",
    "breadcrumb",
    "button",
    "card",
    "card-image",
    "checkbox",
    "checkbox-panel",
    "chip",
    "combobox",
    "countdown",
    "datepicker",
    "description-list",
    "expandable-panel",
    "expander",
    "feedback",
    "field-group",
    "file-input",
    "flex",
    "help",
    "icon",
    "icon-button",
    "image",
    "input-group",
    "link",
    "link-list",
    "list",
    "loader",
    "logo",
    "menu",
    "message",
    "modal",
    "nav-link",
    "pagination",
    "popover",
    "progress-bar",
    "radio-button",
    "radio-panel",
    "screen-reader-only",
    "search",
    "segmented-control",
    "select",
    "select-stable",
    "skeleton",
    "summary-table",
    "system-message",
    "table",
    "table-of-contents",
    "tabs",
    "tag",
    "text-area",
    "text-input",
    "toast",
    "toggle-switch",
    "tooltip",
] as const;

/** A valid Jøkul component ID. Derived from {@link COMPONENT_IDS}. */
export type ComponentId = (typeof COMPONENT_IDS)[number];
