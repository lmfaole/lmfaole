import type { ComponentInfoTypes } from "../../component-info.type.ts";
import type { ResizerTypes } from "./resizer.types.ts";

import "./resizer.css";

export const Resizer = (props: ResizerTypes) => {
	const { children, caption, resize = "both", boxed = false, ...rest } = props;
	return (
		<figure
			data-boxed={boxed}
			data-resize={resize}
			{...rest}
			className={"resizer"}
		>
			<div>{children}</div>
			<figcaption>{caption}</figcaption>
		</figure>
	);
};

export const resizerInfo: ComponentInfoTypes = {
	name: "Resizer",
	category: "layout",
	base: (
		<Resizer caption={"En caption"}>
			<img
				src={
					"https://images.unsplash.com/photo-1747767296029-c5116a707614?q=80&w=4138&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
				}
				alt={"Eksempelbilde"}
			/>
		</Resizer>
	),
	examples: [
		{
			title: "Med padding",
			children: (
				<Resizer caption={"En caption"} boxed>
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
			title: "Display: contents",
			children: (
				<Resizer caption={"En caption"}>
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
