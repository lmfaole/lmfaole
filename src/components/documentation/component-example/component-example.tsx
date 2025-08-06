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
		showTitle = "true",
		columns = "true",
		resize = "both",
		restrict,
		children = <Button>Knapp</Button>,
		open,
		...rest
	} = props;

	return (
		<div className={"component-example"} data-columns={columns} {...rest}>
			<div className={"info"}>
				{showTitle && <h3 className={"title"}>{title}</h3>}
				{typeof description === "string" ? (
					<p className={"description"}>{description}</p>
				) : (
					description
				)}
			</div>
			<div className={"showcase"}>
				<Resizer figcaption={title} resize={resize} restrict={restrict}>
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
		<ComponentExample restrict={false}>
			<Button>Knapp</Button>
		</ComponentExample>
	),
};
