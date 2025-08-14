import { Blockquote } from "../../../../elements";
import type { ElementInfoType } from "../../../../elements/element-info.type.ts";

export const ElementHeader = (element: ElementInfoType) => {
	const { name, meta } = element;

	return (
		<header>
			<h1>{name}</h1>
			<Blockquote cite={{ href: meta.spec, label: "HTML Standarden" }}>
				<p className={"h3"} lang={"en"}>
					{meta.description}
				</p>
			</Blockquote>
		</header>
	);
};
