import { Fragment } from "react";
import { Pre } from "../../elements";
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
				<section>
					<p className={"h3"}>Påkrevde egenskaper</p>
					{!!requiredProps?.length ? (
						requiredProps.map((control, i) => (
							<Fragment key={"required" + i}>{control}</Fragment>
						))
					) : (
						<p className={"muted"}>Ingen påkrevde egenskaper</p>
					)}
				</section>

				<section>
					<p className={"h3"}>Valgfrie egenskaper</p>
					{!!optionalProps?.length ? (
						optionalProps.map((control, i) => (
							<Fragment key={"optional" + i}>{control}</Fragment>
						))
					) : (
						<p className={"muted"}>Ingen valgfrie egenskaper</p>
					)}
				</section>
			</div>

			<output>{children}</output>
			<Pre>{children}</Pre>
		</article>
	);
};
