import { Button } from "../../elements";
import type { ComponentInfoType } from "../component-info.type.ts";
import type { ComponentHeroType } from "./component-hero.type.ts";

import "./component-hero.css";

export const ComponentHero = ({ children }: ComponentHeroType) => {
	return <section className={"component-hero"}>{children}</section>;
};

export const componentHeroInfo: ComponentInfoType = {
	name: "Component Hero",
	category: "tekst",
	example: (
		<ComponentHero>
			<Button>Hei</Button>
		</ComponentHero>
	),
	builtOn: [<small />],
};
