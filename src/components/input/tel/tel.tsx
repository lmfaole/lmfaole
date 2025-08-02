import { useId } from "react";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import type { TelInputTypes } from "./tel.types.ts";

import "./tel.css";

export const TelInput = (props: TelInputTypes) => {
	const id = useId();

	const {
		label = "Telefonnummer",
		autoComplete = "tel-national",
		required = true,
		...rest
	} = props;

	return (
		<>
			<label htmlFor={id}>{label}</label>
			<input
				id={id}
				name={label}
				type="tel"
				inputMode="tel"
				required={required}
				autoComplete={autoComplete}
				{...rest}
			/>
		</>
	);
};

export const telInputInfo: ComponentInfoTypes = {
	name: "Telefon input",
	category: "skjemaelementer",
	examples: [{ code: <TelInput label={"Hva er nummeret ditt?"} /> }],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
