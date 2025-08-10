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
			<div className={"controls"}>
				<Details summary={"Påkrevde egenskaper"} open className={"required"}>
					{!!requiredProps?.length ? (
						requiredProps.map((control, i) => (
							<Fragment key={"required" + i}>{control}</Fragment>
						))
					) : (
						<p>Ingen påkrevde egenskaper</p>
					)}
				</Details>
				<Details summary={"Valgfrie egenskaper"} className={"optional"}>
					{!!optionalProps?.length ? (
						optionalProps.map((control, i) => (
							<Fragment key={"optional" + i}>{control}</Fragment>
						))
					) : (
						<p>Ingen valgfrie egenskaper</p>
					)}
				</Details>
			</div>
			<div className={"result"}>
				<output>{children}</output>
				<Pre>{children}</Pre>
			</div>
		</article>
	);
};
