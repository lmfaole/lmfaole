import type { ButtonHTMLAttributes } from "react";
import type { ComponentInfo } from "../component-info.type.ts";

import "./button.css";

export const buttonInfo: ComponentInfo = {
	name: "Knapp",
	description:
		"The <button> HTML element is an interactive element activated by a user with a mouse, keyboard, finger, voice command, or other assistive technology. Once activated, it then performs an action, such as submitting a form or opening a dialog.",
	spec: "https://html.spec.whatwg.org/#the-button-element",
};

export const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
	const { type = "button", name, ...rest } = props;
	return (
		<button
			type={type}
			name={name}
			title={props.title ? props.title : name}
			{...rest}
		/>
	);
};
