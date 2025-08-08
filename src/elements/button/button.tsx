import type { ElementInfoType } from "../element-info.type.ts";
import type { ButtonType } from "./button.type.ts";

import "./button.css";

export const Button = (props: ButtonType) => {
	const {
		type = "button",
		danger = false,
		accessKey,
		icon,
		iconPosition = "end",
		children,
		...rest
	} = props;

	if (!children) {
		return <button>Mangler innhold</button>;
	}

	return (
		<button
			type={type}
			title={props.title ? props.title : children.toString()}
			accessKey={accessKey}
			data-icon-position={iconPosition}
			data-danger={danger}
			{...rest}
		>
			{icon && iconPosition === "start" && icon}
			{children}
			{icon && iconPosition === "end" && icon}
		</button>
	);
};

export const buttonInfo: ElementInfoType = {
	name: "Button",
	example: <Button>Hei</Button>,
};
