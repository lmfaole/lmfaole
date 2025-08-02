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
	category: "skjemaelementer",
	examples: [
		{
			title: "Radiogruppe",
			code: (
				<RadioGroup legend={"Velg tema"} items={["Auto", "Lyst", "Mørkt"]} />
			),
		},
		{
			title: "Enkeltstående",
			code: <Radio label={"Automatisk"} />,
		},
	],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
