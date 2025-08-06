import { Button } from "../../button";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import { Details } from "../../details";
import { Resizer } from "../../layout";
import { Code } from "../code";
import type { ComponentExampleTypes } from "./component-example.types.ts";

import "./component-example.css";

export const ComponentExample = (props: ComponentExampleTypes) => {
	const {
		title = "Eksempel",
		description,
		resize = "both",
		boxed = true,
		children = <Button>Knapp</Button>,
		open,
		...rest
	} = props;

	return (
		<div className={"component-example"} {...rest}>
			<div className={"info"}>
				<h3 className={"title"}>{title}</h3>
				{typeof description === "string" ? (
					<p className={"description"}>{description}</p>
				) : (
					description
				)}
			</div>
			<div className={"showcase"}>
				<Resizer caption={title} resize={resize} boxed={boxed}>
					{children}
				</Resizer>
				<Details summary={"Markup"} open={open} lang={"en"}>
					<Code>{children}</Code>
				</Details>
			</div>
		</div>
	);
};

export const componentExampleInfo: ComponentInfoTypes = {
	name: "Component Example",
	category: "dokumentasjon",
	base: (
		<ComponentExample>
			<Button>Knapp</Button>
		</ComponentExample>
	),
};
