import type { ComponentInfoTypes } from "../../component-info.type.ts";
import { GenericInput } from "../generic";
import type { NumberInputTypes } from "./number.types.ts";

export const NumberInput = (props: NumberInputTypes) => {
	const { size = 10, inputMode = "numeric", ...rest } = props;

	return (
		<GenericInput type="number" size={size} inputMode={inputMode} {...rest} />
	);
};

export const numberInputInfo: ComponentInfoTypes = {
	name: "Tall",
	category: "skjema",
	examples: [
		{ code: <NumberInput label={"Skriv et tall"} /> },
		{
			title: "Ikke aktiv",
			code: (
				<NumberInput
					disabled
					label={"Skriv et tall"}
					datalist={[0, 10, 20, 25]}
					suffix={"is"}
				/>
			),
		},
		{
			title: "Med nevner",
			code: (
				<NumberInput
					label={"Skriv et tall"}
					datalist={[0, 10, 20, 25]}
					suffix={"is"}
				/>
			),
		},
	],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
