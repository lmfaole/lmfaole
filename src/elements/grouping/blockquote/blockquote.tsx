import type { ElementInfoType } from "../../element-info.type.ts";
import type { BlockquoteType } from "./blockquote.type.ts";

import "./blockquote.css";

export const Blockquote = ({ cite, children }: BlockquoteType) => {
	return (
		<blockquote>
			{children}
			<p>
				<cite>
					<a href={cite.href}>{cite.label}</a>
					{cite.author && <span> – {cite.author}</span>}
				</cite>
			</p>
		</blockquote>
	);
};

export const blockquoteInfo: ElementInfoType = {
	name: "Blockquote",
	img: (
		<Blockquote
			cite={{
				href: "https://www.miriamsuzanne.com/2024/08/08/vision/",
				label: "We don’t need a boss, we need a process",
				author: "Miriam Eric Suzanne",
			}}
		>
			<p>
				What we like about a dictator is that they have a vision, and set the
				process, and take the responsibility to be decisive when necessary. But
				it’s not impossible for us to do that together, if we learn how to hold
				a strong vision collectively.
			</p>
			<p>
				We must become a team, united against our work. Our job, together, is to
				hone and curate that work towards the exclusive vision through
				continuous questioning and articulation.
			</p>
			<p>
				We define a vision by the choices we make, and we clarify that vision by
				the choices we reject.
			</p>
		</Blockquote>
	),
	meta: {
		description:
			"The blockquote element represents a section that is quoted from another source.",
		spec: "https://html.spec.whatwg.org/multipage/grouping-content.html#the-blockquote-element",
		category: "gruppering",
		aka: ["hero"],
	},
};
