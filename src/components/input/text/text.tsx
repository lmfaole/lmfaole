import { mockFlavors } from "../../component.mock.data.ts";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import { GenericInput } from "../generic";
import type { TextTypes } from "./text.types.ts";

export const TextInput = (props: TextTypes) => {
	const { ...rest } = props;

	return <GenericInput type="text" {...rest} />;
};

export const textInputInfo: ComponentInfoTypes = {
	name: "Tekst",
	category: "skjema",
	examples: [
		{
			code: <TextInput label={"Hvilken smak ønsker du?"} required={false} />,
		},
		{
			title: "Med dataliste for forslag",
			code: (
				<TextInput label={"Hvilken smak ønsker du?"} datalist={mockFlavors} />
			),
		},
	],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
