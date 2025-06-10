<script lang="ts">
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<header>
	<a href="/">Home</a>
</header>

<main>
	{@render children()}
</main>

<footer>
	<h2>My links</h2>
	<ul>
		<li><a href="https://github.com/lmfaole" rel="me">Github</a></li>
		<li><a href="https://www.linkedin.com/in/olejorgenbakken/" rel="me">LinkedIn</a></li>
	</ul>
	<h2>About this site</h2>
	<dl>
		<dt>Link</dt>
		<dd><a href="{data.html_url}">Github repo</a></dd>
		<dt>Updated</dt>
		<dd>{new Date(data.updated_at).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}</dd>
		<dt>Size</dt>
		<dd>{data.size} KB</dd>
	</dl>
</footer>

<style>
    header, main, footer {
        max-width: 90ch;
        margin-inline: auto;
        width: 100%;
        padding-inline: 1rem;
    }

    header {
        padding-block: 2ex;
    }

    main {
        flex: 1;
    }

    footer {
        container: footer / inline-size;
        border-block-start: 1px solid oklch(from currentColor l c h / 0.1);
        padding-block: 2lh;

        @media (min-width: 375px) {
            display: grid;
            grid-auto-flow: column;
            grid-template-areas: "links meta"
		"links meta";
            grid-template-columns: repeat(2, max-content);
            gap: 1ch 12ch;
        }

        h2 {
            font-size: large;
            margin: 0;
        }

        ul, dl {
            margin-block: 1ex 0;
            padding: 0;
        }

        ul {
            list-style: none;

            li {
                margin-block-end: .5lh;
            }
        }

        dl {
            display: grid;
            grid-template-columns: max-content 1fr;
            gap: 0.5lh 3ch;

            dd {
                margin-inline-start: 0;
            }
        }
    }
</style>