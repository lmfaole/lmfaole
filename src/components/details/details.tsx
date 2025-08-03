import type { ComponentInfoTypes } from "../component-info.type.ts";
import type { DetailsTypes } from "./details.types.ts";

import "./details.css";

export const Details = (props: DetailsTypes) => {
	const { summary, children, ...rest } = props;
	return (
		<details {...rest}>
			{summary && <summary>{summary}</summary>}
			<div>{children}</div>
		</details>
	);
};

export const detailsInfo: ComponentInfoTypes = {
	name: "Details",
	category: "handlinger",
	examples: [{ code: <Details summary={"React"}>Detaljer</Details> }],
	spec: "https://html.spec.whatwg.org/#the-details-element",
};

export default detailsInfo;
