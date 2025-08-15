import type { ButtonType } from "./button.type.ts";

export const Button = (props: ButtonType) => {
	const { children, ...rest } = props;

	return <button {...rest}>{children}</button>;
};
