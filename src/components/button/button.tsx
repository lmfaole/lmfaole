import type { ButtonTypes } from "./button.types.ts";

import "./button.css";

export const Button = (props: ButtonTypes) => {
	const { type = "button", ...rest } = props;
	return <button type={type} {...rest} />;
};
