import type { ButtonProps } from "./button.types.ts";

import "./button.css";

export const Button = (props: ButtonProps) => {
	const { type = "button", ...rest } = props;
	return <button type={type} {...rest} />;
};
