import { Button, Pre } from "../../elements";
import type { ComponentExampleType } from "./component-example.type.ts";

import "./component-example.css";

export const ComponentExample = ({
	title = "Eksempel",
	description,
	children = <Button>Knapp</Button>,
	showMarkup = true,
	interactive = false,
	...rest
}: ComponentExampleType) => {
	return (
		<div className={"component-example"} {...rest}>
			<p className={"title h3"} data-theme={"dark"}>
				{title}
			</p>
			<div className={"showcase"}>
				<div inert={!interactive}>{children}</div>
				{showMarkup && <Pre language={"html"}>{children}</Pre>}
			</div>
		</div>
	);
};
