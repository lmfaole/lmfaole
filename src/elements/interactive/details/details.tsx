import type { ElementInfoType } from "../../element-info.type.ts";
import type { DetailsType } from "./details.type.ts";

import "./details.css";

export const Details = (props: DetailsType) => {
	const { summary = "Les mer", children, ...rest } = props;
	return (
		<details {...rest}>
			<summary>{summary}</summary>
			<div>{children}</div>
		</details>
	);
};

export const detailsInfo: ElementInfoType = {
	name: "Details",
	img: <Details>Detaljer</Details>,
	meta: {
		description:
			"The details element represents a disclosure widget from which the user can obtain additional" +
			" information or controls.",
		spec: "https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element",
		category: "interaksjon",
		aka: ["accordion", "trekkspill-liste"],
	},
	usage: [
		{
			title: "I løpende tekst",
			example: (
				<div>
					<p>Her er en del løpende tekst. Litt Lorem Ipsum.</p>
					<Details>Detaljer</Details>
				</div>
			),
		},
		{
			title: "Flere elementer etter hverandre",
			example: (
				<div>
					<Details>Detaljer</Details>
					<Details>Detaljer</Details>
					<Details>Detaljer</Details>
					<Details>Detaljer</Details>
					<Details>Detaljer</Details>
				</div>
			),
		},
		{
			title: "Kun en åpen i en gruppe",
			example: (
				<div>
					<Details name={"detaljer"}>Detaljer</Details>
					<Details name={"detaljer"}>Detaljer</Details>
					<Details name={"detaljer"}>Detaljer</Details>
					<Details name={"detaljer"}>Detaljer</Details>
					<Details name={"detaljer"}>Detaljer</Details>
				</div>
			),
		},
	],
};

export default detailsInfo;
