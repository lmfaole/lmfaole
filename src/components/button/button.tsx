import type { ComponentInfoTypes } from "../component-info.type.ts";

import "./button.css";
import type { ButtonTypes } from "./button.types.ts";

export const Button = (props: ButtonTypes) => {
	const { type = "button", accessKey, value, ...rest } = props;

	return (
		<button
			type={type}
			title={props.title ? props.title : value.toString()}
			value={value}
			accessKey={accessKey}
			{...rest}
		>
			{value} {accessKey && <b>[{accessKey}]</b>}
		</button>
	);
};

export const buttonInfo: ComponentInfoTypes = {
	name: "Button",
	category: "handling",
	examples: [
		{
			code: <Button value={"Knapp"} />,
		},
		{
			title: "Ikke aktiv",
			code: <Button disabled value={"Ikke aktiv knapp"} />,
		},
		{
			title: "Med snarvei",
			code: <Button accessKey={"S"} value={"Knapp med snarvei"} />,
		},
	],
	description:
		"The <button> HTML element is an interactive element activated by a user with a mouse, keyboard, finger, voice command, or other assistive technology. Once activated, it then performs an action, such as submitting a form or opening a dialog.",
	spec: "https://html.spec.whatwg.org/#the-button-element",
};
