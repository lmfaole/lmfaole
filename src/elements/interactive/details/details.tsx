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
