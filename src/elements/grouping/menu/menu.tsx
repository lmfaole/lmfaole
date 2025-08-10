import type { ElementInfoType } from "../../element-info.type.ts";
import { Button } from "../../forms/button/button.tsx";
import type { MenuType } from "./menu.type.ts";

import "./menu.css";

export const Menu = ({
	label,
	showLabel = false,
	children,
	...rest
}: MenuType) => {
	return (
		<menu aria-label={label} data-show-label={showLabel} {...rest}>
			{children}
		</menu>
	);
};

export const menuInfo: ElementInfoType = {
	name: "Menu",
	img: (
		<Menu label={"Menylinje"} showLabel>
			<li>
				<Button>Kopier</Button>
			</li>
			<li>
				<Button>Lim inn</Button>
			</li>
		</Menu>
	),
	meta: {
		description:
			"The menu element represents a toolbar consisting of its contents, in the form of an unordered list of items (represented by li elements), each of which represents a command that the user can perform or activate.",
		spec: "https://html.spec.whatwg.org/multipage/grouping-content.html#the-menu-element",
		category: "gruppering",
		aka: ["menylinje", "meny", "toolbar"],
	},
};
