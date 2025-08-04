import type { ComponentInfoTypes } from "../../component-info.type.ts";
import { GenericInput } from "../generic";
import type { TelInputTypes } from "./tel.types.ts";

export const TelInput = (props: TelInputTypes) => {
	const {
		label = "Telefonnummer",
		autoComplete = "tel-national",
		size = 12,
		...rest
	} = props;

	return (
		<GenericInput
			type="tel"
			inputMode="tel"
			label={label}
			size={size}
			autoComplete={autoComplete}
			{...rest}
		/>
	);
};

export const telInputInfo: ComponentInfoTypes = {
	name: "Telefonnummer",
	category: "skjema",
	base: <TelInput required={false} />,
	examples: [
		{ title: "Ikke aktiv", children: <TelInput required={false} disabled /> },
	],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
