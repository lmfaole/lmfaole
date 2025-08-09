import type { ElementInfoType } from "../element-info.type.ts";
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
	example: <Details>Detaljer</Details>,
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
