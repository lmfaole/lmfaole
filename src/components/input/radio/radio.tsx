import { mockFlavors } from "../../component.mock.data.ts";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import type { RadioTypes } from "./radio.types.ts";
import { RadioGroup } from "./radio-group.tsx";

import "./radio.css";

export const Radio = (props: RadioTypes) => {
	const { label, name, ...rest } = props;
	return (
		<label>
			<input type="radio" name={name ? name : label} {...rest} />
			<span>{label}</span>
		</label>
	);
};

export const radioInfo: ComponentInfoTypes = {
	name: "Radio",
	category: "skjema",
	base: <Radio label={mockFlavors[0]} />,
	examples: [
		{
			title: "Ikke aktiv",
			children: <Radio label={mockFlavors[0]} disabled />,
		},
		{
			title: "Radiogruppe",
			children: (
				<RadioGroup legend={"Velg smak"} items={mockFlavors.slice(0, 3)} />
			),
		},
		{
			title: "Ikke aktiv radiogruppe",
			children: (
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
