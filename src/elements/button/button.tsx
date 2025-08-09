import type { ElementInfoType } from "../element-info.type.ts";
import type { ButtonType } from "./button.type.ts";

import "./button.css";

export const Button = (props: ButtonType) => {
	const { type = "button", accessKey, children, ...rest } = props;

	if (!children) {
		return <button>Mangler innhold</button>;
	}

	return (
		<button
			type={type}
			title={props.title ? props.title : children.toString()}
			{...rest}
		>
			{children}
		</button>
	);
};

export const buttonInfo: ElementInfoType = {
	name: "Button",
	example: <Button>Hei</Button>,
};
