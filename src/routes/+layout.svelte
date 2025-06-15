<script lang="ts">
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	let repo = data.repo;
	let user = data.user;
</script>

<!--<header>
	<a href="/">Home</a>
</header>-->

<main>
	{@render children()}
</main>

<footer>

	<h2>Me</h2>
	<dl>
		<dt>My links</dt>
		<dd><a href="{user.html_url}" rel="me">Github</a></dd>
		<dd><a href="https://www.linkedin.com/in/olejorgenbakken/" rel="me">LinkedIn</a></dd>
		<dt>Location</dt>
		<dd>{user.location}</dd>
		<dt>Company</dt>
		<dd>{user.company}</dd>
		<dt>My face</dt>
		<dd>
			<a href="{user.avatar_url}">
				<img alt="My face" class="avatar blob" src="{user.avatar_url}">
			</a>
		</dd>
	</dl>

	<h2>About this site</h2>
	<dl>
		<dt>Link</dt>
		<dd><a href="{repo.html_url}">Github repo</a></dd>
		<dt>Updated</dt>
		<dd>{new Date(repo.updated_at).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}</dd>
		<dt>Size</dt>
		<dd>{repo.size} KB</dd>
	</dl>
</footer>

<style>
    header, main, footer {
        max-width: 90ch;
        margin-inline: auto;
        width: 100%;
        padding-inline: 2vw;
    }

    header {
        padding-block: 2ex;
    }

    main {
        /*flex: 1;*/
    }

    footer {
        padding-block-end: 1lh;

        h2 {
            font-size: large;
            margin-block: 4ch 0;
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
                grid-column: 2;
            }
        }
    }
</style>