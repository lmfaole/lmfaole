import type { ButtonHTMLAttributes } from "react";

import "./button.css";

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
