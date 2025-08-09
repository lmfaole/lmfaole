import { Fragment } from "react";
import { Details, Pre } from "../../elements";
import type { PlaygroundType } from "./playground.type.ts";

import "./playground.css";

export const Playground = ({
	requiredProps,
	optionalProps,
	children,
}: PlaygroundType) => {
	return (
		<article className={"playground"}>
			<output>{children}</output>
			<div className={"controls"}>
				<Details summary={"Påkrevde props"} open className={"required"}>
					{requiredProps.map((control, i) => (
						<Fragment key={"required" + i}>{control}</Fragment>
					))}
				</Details>
				{optionalProps && (
					<Details summary={"Valgfrie props"} open className={"optional"}>
						{optionalProps.map((control, i) => (
							<Fragment key={"optional" + i}>{control}</Fragment>
						))}
					</Details>
				)}
			</div>
			<Pre>{children}</Pre>
		</article>
	);
};
