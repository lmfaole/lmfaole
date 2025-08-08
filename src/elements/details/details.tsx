import type { ElementInfoType } from "../element-info.type.ts";
import type { DetailsType } from "./details.type.ts";

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
};

export default detailsInfo;
