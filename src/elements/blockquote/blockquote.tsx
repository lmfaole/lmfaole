import type { ElementInfoType } from "../element-info.type.ts";
import type { BlockquoteType } from "./blockquote.type.ts";

import "./blockquote.css";

export const Blockquote = ({ cite, children }: BlockquoteType) => {
	return (
		<blockquote>
			{children}
			<p>
				<cite>
					<a href={cite.href}>{cite.label}</a>
				</cite>
			</p>
		</blockquote>
	);
};

export const blockquoteInfo: ElementInfoType = {
	name: "Blockquote",
	img: <Blockquote cite={{ href: "2", label: "2" }}>Hei</Blockquote>,
};
