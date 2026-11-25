/**
 * How a name that has a page of its own reads as a link: the same in every app, so a name looks alike wherever it is listed.
 * Pressed, the underline is solid and thicker: the answer to a tap before the next page arrives. `inline-block min-h-6`: a link in a list is a target of at least 1.5rem (WCAG 2.2, 2.5.8), which a line of small text is not.
 */
export const ENTITY_LINK = "inline-block min-h-6 underline decoration-dotted underline-offset-4 hover:decoration-solid active:decoration-solid active:decoration-2"

/**
 * A row, card or tile that a link inside it covers whole: give the container `STRETCHED_ROW` and the one link `STRETCHED_LINK`.
 * The link stays the one named target in the reading order (a screen reader hears its text, not the whole row), while a tap or click anywhere on the row follows it.
 * Other interactive things in the row must be lifted above the cover with `ABOVE_STRETCH`, or they could not be reached by a pointer.
 * The focus ring is drawn around the row, not the text, so the target that a keyboard sees is the one a pointer has.
 */
export const STRETCHED_ROW = "relative isolate has-[a[data-stretched]:hover]:bg-muted/40 has-[a[data-stretched]:focus-visible]:outline-2 has-[a[data-stretched]:focus-visible]:outline-offset-2 has-[a[data-stretched]:focus-visible]:outline-ring rounded-md"
export const STRETCHED_LINK = "after:absolute after:inset-0 after:content-[''] after:rounded-[inherit] focus-visible:outline-none"
export const ABOVE_STRETCH = "relative z-10"

/**
 * A row of a list that its one stretched link covers whole (`List`, `SourceList`): tinted under a pointer, ringed under keyboard focus, reaching
 * 0.5rem out on each side so the tint has room. Every other link and button in it is lifted above the cover and stays its own target.
 */
export const LINKED_ROW = `${STRETCHED_ROW} has-[a[data-stretched]]:-mx-2 has-[a[data-stretched]]:px-2 [&_a:not([data-stretched])]:relative [&_a:not([data-stretched])]:z-10 [&_button]:relative [&_button]:z-10`
