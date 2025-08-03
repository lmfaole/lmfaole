import { mockFlavors } from "../../component.mock.data.ts";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import type { RadioTypes } from "./radio.types.ts";
import { RadioGroup } from "./radio-group.tsx";

export const Radio = (props: RadioTypes) => {
	return (
		<label>
			<input type="radio" {...props} />
			{props.label}
		</label>
	);
};

export const radioInfo: ComponentInfoTypes = {
	name: "Radio",
	category: "skjema",
	examples: [
		{
			title: "Enkeltstående",
			code: <Radio label={mockFlavors[0]} />,
		},
		{
			title: "Ikke aktiv",
			code: <Radio label={mockFlavors[0]} disabled />,
		},
		{
			title: "Radiogruppe",
			code: <RadioGroup legend={"Velg smak"} items={mockFlavors.slice(0, 3)} />,
		},
		{
			title: "Ikke aktiv radiogruppe",
			code: (
				<RadioGroup
					legend={"Velg smak"}
					items={mockFlavors.slice(0, 3)}
					disabled
				/>
			),
		},
	],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
