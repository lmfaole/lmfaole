import type { ElementInfoType } from "../element-info.type.ts";
import type { ButtonType } from "./button.type.ts";

import "./button.css";
import { ButtonPlayground } from "./button.playground.tsx";

export const Button = (props: ButtonType) => {
	const { children, ...rest } = props;

	return <button {...rest}>{children}</button>;
};

export const buttonInfo: ElementInfoType = {
	name: "Button",
	meta: {
		description:
			"The button element represents a button labeled by its contents.\n" +
			"\n",
		spec: "https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element",
		aka: ["knapp", "action"],
	},
	img: <Button>Hei</Button>,
	playground: ButtonPlayground,
};
