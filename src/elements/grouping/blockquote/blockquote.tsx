import type { BlockquoteType } from "./blockquote.type.ts";

export const Blockquote = ({ cite, children }: BlockquoteType) => {
	return (
		<blockquote>
			{children}

			<footer>
				<p>
					<cite>
						<a href={cite.href}>{cite.label}</a>
					</cite>
					{cite.author && <span> – {cite.author}</span>}
				</p>
			</footer>
		</blockquote>
	);
};
