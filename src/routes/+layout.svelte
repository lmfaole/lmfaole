<script lang="ts">
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<main>
	{@render children()}
</main>

<footer>
	<h2>Meta</h2>
	<dl>
		<dt>Updated at</dt>
		<dd>{new Date(data.updated_at).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}</dd>
		<dt>Size</dt>
		<dd>{data.size} KB</dd>
	</dl>
</footer>