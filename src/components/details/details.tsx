import type { ComponentInfo } from "../component-info.type.ts";
import type { DetailsTypes } from "./details.types.ts";

import "./details.css";

export const detailsDetails: ComponentInfo = {
	name: "Detaljer",
	spec: "https://html.spec.whatwg.org/#the-details-element",
};

export const Details = (props: DetailsTypes) => {
	const { summary, children, ...rest } = props;
	return (
		<details {...rest}>
			{summary && <summary>{summary}</summary>}
			{children}
		</details>
	);
};
