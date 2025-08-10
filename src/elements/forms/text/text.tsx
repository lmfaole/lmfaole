import { useId } from "react";
import type { ElementInfoType } from "../../element-info.type.ts";
import type { TextType } from "./text.type.ts";

import "./text.css";

export const Text = (props: TextType) => {
	const { label, ...rest } = props;
	const id = useId();

	return (
		<div className={"text-input"}>
			<label htmlFor={label + id}>{label}</label>
			<input {...rest} id={label + id} type="text" />
		</div>
	);
};

export const textInputInfo: ElementInfoType = {
	name: "Text",
	img: <Text label={"Hvilken smak ønsker du?"} />,
	meta: {
		description:
			"The input element represents a one line plain text edit control for the element's value.",
		spec: "https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)",
		category: "skjema",
		aka: ["tekst-input"],
	},
};
