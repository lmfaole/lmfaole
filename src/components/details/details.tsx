import type { ComponentInfoTypes } from "../component-info.type.ts";
import type { DetailsTypes } from "./details.types.ts";

import "./details.css";

export const Details = (props: DetailsTypes) => {
	const { summary = "Les mer", children, ...rest } = props;
	return (
		<details {...rest}>
			<summary>{summary}</summary>
			<div>{children}</div>
		</details>
	);
};

export const detailsInfo: ComponentInfoTypes = {
	name: "Details",
	category: "handlinger",
	examples: [
		{ code: <Details>Detaljer</Details> },
		{
			title: "Liste",
			code: (
				<>
					<Details summary={"Detaljer 1"}>Detaljer</Details>
					<Details summary={"Detaljer 2"}>Detaljer</Details>
					<Details summary={"Detaljer 3"}>Detaljer</Details>
				</>
			),
		},
		{
			title: "Liste med trekkspill",
			description: (
				<p>
					Ved å sette samme <code>name</code>-egenskap vil du kunne kontrollere
					at kun én er åpen om gangen.
				</p>
			),
			code: (
				<>
					<Details summary={"Detaljer 1"} name={"detaljer"}>
						Detaljer
					</Details>
					<Details summary={"Detaljer 2"} name={"detaljer"}>
						Detaljer
					</Details>
					<Details summary={"Detaljer 3"} name={"detaljer"}>
						Detaljer
					</Details>
				</>
			),
		},
	],
	spec: "https://html.spec.whatwg.org/#the-details-element",
};

export default detailsInfo;
