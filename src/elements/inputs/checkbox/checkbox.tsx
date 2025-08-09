import { mockFlavors } from "../../../components/component.mock.data.ts";
import type { ElementInfoType } from "../../element-info.type.ts";
import type { CheckboxType } from "./checkbox.type.ts";

import "./checkbox.css";

export const Checkbox = (props: CheckboxType) => {
	const { label, ...rest } = props;

	return (
		<label>
			<input type="checkbox" {...rest} />
			{label}
		</label>
	);
};

export const checkboxInfo: ElementInfoType = {
	name: "Checkbox",
	img: <Checkbox label={mockFlavors[0]} />,
};
