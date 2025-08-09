import { Menu } from "../../elements/menu/menu.tsx";
import type { PlaygroundType } from "./playground.type.ts";

import "./playground.css";
import { Pre } from "../../elements";

export const Playground = ({ controls, children }: PlaygroundType) => {
	return (
		<article className={"playground"}>
			<output>{children}</output>
			<Menu label={"Kontroller"} showLabel className={"controls"}>
				{controls}
			</Menu>
			<Pre>{children}</Pre>
		</article>
	);
};
