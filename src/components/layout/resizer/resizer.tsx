import type { ResizerTypes } from "./resizer.types.ts";

import "./resizer.css";

export const Resizer = (props: ResizerTypes) => {
	const {
		children,
		figcaption,
		padding = true,
		resize = "both",
		...rest
	} = props;
	return (
		<figure
			{...rest}
			className="resizer"
			data-padding={padding}
			data-resize={resize}
		>
			{children}
			<figcaption>{figcaption}</figcaption>
		</figure>
	);
};
