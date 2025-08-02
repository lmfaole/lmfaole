import type { ComponentInfoTypes } from "../../component-info.type.ts";
import type { ResizerTypes } from "./resizer.types.ts";

import "./resizer.css";

export const Resizer = (props: ResizerTypes) => {
	const {
		children,
		figcaption,
		padding = true,
		resize = "both",
		...rest
	} = props;
	return (
		<figure
			{...rest}
			className={"resizer"}
			data-padding={padding}
			data-resize={resize}
		>
			{children}
			<figcaption>{figcaption}</figcaption>
		</figure>
	);
};

export const resizerInfo: ComponentInfoTypes = {
	name: "Resizer",
	category: "layout",
	examples: [
		{
			code: (
				<Resizer figcaption={"En caption"}>
					<p>Velkommen</p>
				</Resizer>
			),
		},

		{
			title: "Uten padding",
			code: (
				<Resizer figcaption={"En caption"} padding={false}>
					<p>Velkommen</p>
				</Resizer>
			),
		},
	],
};
