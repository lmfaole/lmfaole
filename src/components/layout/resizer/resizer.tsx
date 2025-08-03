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
			<div>{children}</div>
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
					<img
						src={
							"https://images.unsplash.com/photo-1747767296029-c5116a707614?q=80&w=4138&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
						}
						alt={"Eksempelbilde"}
					/>
				</Resizer>
			),
		},

		{
			title: "Uten padding",
			code: (
				<Resizer figcaption={"En caption"} padding={false}>
					<img
						src={
							"https://images.unsplash.com/photo-1747767296029-c5116a707614?q=80&w=4138&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
						}
						alt={"Eksempelbilde"}
					/>
				</Resizer>
			),
		},
	],
};
