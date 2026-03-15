/**
 * Used by `@next/mdx` as the import source for `useMDXComponents`.
 *
 * Having this file in-repo ensures MDX does not fall back to importing
 * `@mdx-js/react`, which relies on React context and is treated as client-only
 * by Next in Server Components.
 */
const components = {};

export function useMDXComponents() {
    return components;
}

