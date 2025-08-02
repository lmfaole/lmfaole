import { useId } from "react";
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

	if (autoComplete === "tel") {
		return (
			<fieldset>
				<legend>{label}</legend>

				<label htmlFor={`${id}-cc`}>Landekode</label>
				<input
					id={`${id}-cc`}
					size={3}
					name={`${id}-cc`}
					type="text"
					inputMode="text"
					required={required}
					autoComplete={"tel-country-code"}
					defaultValue={"+47"}
					placeholder={"+47"}
					{...rest}
				/>

				<label htmlFor={`${id}-tel`}>Telefonnummer</label>
				<input
					id={`${id}-tel`}
					name={`${id}-tel`}
					type="text"
					size={9}
					inputMode="tel"
					required={required}
					autoComplete={"tel-local"}
					{...rest}
				/>
			</fieldset>
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
