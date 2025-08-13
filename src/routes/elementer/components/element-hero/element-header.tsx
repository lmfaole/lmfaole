import { Blockquote } from "../../../../elements";
import type { ElementInfoType } from "../../../../elements/element-info.type.ts";

import "./element-header.css";

export const ElementHeader = ({ name, meta, img }: ElementInfoType) => {
	return (
		<header className="element-header">
			<div className={"info"}>
				<h1>
					{name}
					{meta.aka && (
						<span>
							, <small className={"muted h3"}>{meta.aka.join(", ")}</small>
						</span>
					)}
				</h1>
				<Blockquote cite={{ href: meta.spec, label: "HTML Standarden" }}>
					<p className={"h3"} lang={"en"}>
						{meta.description}
					</p>
				</Blockquote>
			</div>
			<div className={"example"}>
				<div>{img}</div>
			</div>
		</header>
	);
};
