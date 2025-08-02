import { useId } from "react";
import type { TelInputTypes } from "./tel.types.ts";

import "./tel.css";

export const PhoneNumberInput = (props: TelInputTypes) => {
	const id = useId();

	const {
		label = "Telefonnummer",
		autoComplete = "tel-national",
		required = true,
		...rest
	} = props;

	if (autoComplete === "tel") {
		return (
			<>
				<label htmlFor={`${id}-cc ${id}-tel`}>{label}</label>
				<input
					id={`${id}-cc`}
					name={label}
					type="tel"
					inputMode="tel"
					required={required}
					autoComplete={"tel-country-code"}
					{...rest}
				/>
				<input
					id={`${id}-tel`}
					name={label}
					type="tel"
					inputMode="tel"
					required={required}
					autoComplete={"tel-local"}
					{...rest}
				/>
			</>
		);
	}

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
