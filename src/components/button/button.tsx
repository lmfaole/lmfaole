import type { ButtonHTMLAttributes } from "react";

import "./button.css";

export const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
	const { type = "button", ...rest } = props;
	return <button type={type} {...rest} />;
};
