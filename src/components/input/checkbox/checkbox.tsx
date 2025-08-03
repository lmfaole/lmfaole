import { mockFlavors } from "../../component.mock.data.ts";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import type { CheckboxTypes } from "./checkbox.types.ts";
import { CheckboxGroup } from "./checkbox-group.tsx";

export const Checkbox = (props: CheckboxTypes) => {
	return (
		<label>
			<input type="checkbox" {...props} />
			{props.label}
		</label>
	);
};

export const checkboxInfo: ComponentInfoTypes = {
	name: "Checkbox",
	category: "skjema",
	examples: [
		{
			title: "Enkeltstående",
			code: <Checkbox label={mockFlavors[0]} />,
		},
		{
			title: "Avkrysningsbokser i gruppe",
			code: (
				<CheckboxGroup legend={"Checkbox"} items={mockFlavors.slice(0, 4)} />
			),
		},
	],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
