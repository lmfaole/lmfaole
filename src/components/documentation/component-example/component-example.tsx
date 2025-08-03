import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "../../button";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import { Details } from "../../details";
import { Resizer } from "../../layout";
import type { ComponentExampleTypes } from "./component-example.types.ts";

import "./component-example.css";

export const ComponentExample = (props: ComponentExampleTypes) => {
	const {
		title = "Eksempel",
		description,
		showTitle = "true",
		columns = "true",
		resize = "both",
		code,
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
				<Resizer figcaption={title} resize={resize}>
					{code}
				</Resizer>
				<Details summary={"Markup"}>
					<pre>
						<code>{renderToStaticMarkup(code)}</code>
					</pre>
				</Details>
			</div>
		</div>
	);
};

export const componentExampleInfo: ComponentInfoTypes = {
	name: "Component Example",
	category: "dokumentasjon",
	examples: [
		{
			code: <ComponentExample code={<Button />} />,
		},
	],
};
