# Copilot instructions for lmfaole.party

This repository is a single, plain static homepage - `index.html` +
`styles.css` at the repo root. No build step, no JavaScript framework,
no design system. It just shows a name and a short list of links
(GitHub, LinkedIn, e-mail).

Keep it exactly this simple:

- Don't introduce a bundler, package manager, or JS runtime unless
  explicitly asked.
- Don't add client-side JavaScript unless explicitly asked.
- Edit `index.html`/`styles.css` directly; there is nothing to
  generate or build.

## Link lists

A `<ul>` where every `<li>` holds nothing but a link belongs inside
`<nav>`, and is styled as a button grid via the `nav ul`/`nav ul a`
rules in `styles.css` (bordered buttons, `auto-fit` grid) - never as a
plain bulleted list.
