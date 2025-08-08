import { Button } from "../../button";
import { Code } from "../../code";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import type { ComponentExampleTypes } from "./component-example.types.ts";

import "./component-example.css";

export const ComponentExample = ({
	title = "Eksempel",
	description,
	children = <Button>Knapp</Button>,
	showMarkup = true,
	interactive = false,
	...rest
}: ComponentExampleTypes) => {
	return (
		<div className={"component-example"} {...rest}>
			<p className={"title h3"} data-theme={"dark"}>
				{title}
			</p>
			<div className={"showcase"}>
				<div inert={!interactive}>{children}</div>
				{showMarkup && <Code language={"html"}>{children}</Code>}
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
