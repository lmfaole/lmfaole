import { mockFlavors } from "../../../components/component.mock.data.ts";
import type { ElementInfoType } from "../../element-info.type.ts";
import type { RadioType } from "./radio.type.ts";

import "./radio.css";

export const Radio = (props: RadioType) => {
	const { label, name, ...rest } = props;
	return (
		<label>
			<input type="radio" name={name ? name : label} {...rest} />
			{label}
		</label>
	);
};

export const radioInfo: ElementInfoType = {
	name: "Radio",
	img: <Radio label={mockFlavors[0]} />,
};
