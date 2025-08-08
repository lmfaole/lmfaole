import type { ElementInfoType } from "../../element-info.type.ts";
import type { TextType } from "./text.type.ts";

export const Text = (props: TextType) => {
	const { label, ...rest } = props;

	return (
		<label>
			{label}
			<input {...rest} type="text" />
		</label>
	);
};

export const textInputInfo: ElementInfoType = {
	name: "Text",
	example: <Text label={"Hvilken smak ønsker du?"} />,
};
