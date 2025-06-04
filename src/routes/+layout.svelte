<script>
	import './styles.css';
</script>

<div class="app">
	<header>
		Fritt Palestina.
	</header>
	<main>
		<slot />
	</main>
	<footer>
		<p>Du kan følge, stalke eller kontakte meg på
			<a href="https://bsky.app/profile/lmfaole.no" rel="me">Bluesky</a>,
			<a href="https://github.com/lmfaole" rel="me">Github</a> eller
			<a href="https://www.linkedin.com/in/olejorgenbakken/" rel="me opener">LinkedIn</a>.
		</p>
	</footer>
</div>

<style>
    .app {
        display: flex;
        flex-direction: column;
        min-height: 100svh;
    }

    header, main, footer {
        max-width: var(--max-width);
        margin-inline: auto;
        padding-inline: 2ch;
        width: 100%;
        box-sizing: border-box;
    }

    header, footer {
        padding-block: 1ch;
    }

    header {
        border-block-end: var(--border);
    }

    main {
        flex: 1;
    }

    footer {
        border-block-start: var(--border);
    }
</style>