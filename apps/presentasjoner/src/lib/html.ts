/**
 * The document a downloaded talk is sent as: the page's own markup and the site's own stylesheet, in one file that needs nothing from the
 * net to be read. Pure, so `html.test.ts` runs it as it is: the markup and the CSS are handed in, by the endpoint that has them.
 */

/** Text of ours inside a tag or an attribute: never read as markup. */
export const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (mark) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[mark] ?? mark)

/**
 * One file: the head `Document.astro` has, with the stylesheet inline instead of linked and nothing of the link preview (the file has no
 * address), and the markup in `<body>`. Opened from the net the fonts are there; opened from the disk the `url()`s of `@font-face` find
 * nothing and the reader's own font is used, which is the one thing about the file that is not as the page.
 */
export function htmlDocument({ title, description, css, body }: { title: string; description?: string | undefined; css: string; body: string }): string {
  return [
    '<!doctype html>',
    '<html lang="nb">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    `<title>${escapeHtml(title)}</title>`,
    ...(description === undefined ? [] : [`<meta name="description" content="${escapeHtml(description)}">`]),
    '<meta name="color-scheme" content="light dark">',
    `<style>${css}</style>`,
    '</head>',
    `<body>${body}</body>`,
    '</html>',
    '',
  ].join('\n')
}
