import type { ButtonType } from "./button.type.ts";

export const Button = (props: ButtonType) => {
	const { children, type = "button", ...rest } = props;

	return (
		<button type={type} {...rest}>
			{children}
		</button>
	);
};
