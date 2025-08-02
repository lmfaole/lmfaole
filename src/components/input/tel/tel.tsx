import { useId } from "react";
import type { TelInputTypes } from "./tel.types.ts";

export const PhoneNumberInput = (props: TelInputTypes) => {
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
