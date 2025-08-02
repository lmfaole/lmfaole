import { TextInput } from "../text/text.tsx";
import type { CardNumberInputTypes } from "./card-number.types.ts";

export const CardNumberInput = (props: CardNumberInputTypes) => {
	const {
		label = "Kredittkortnummer",
		autoComplete = "cc-number",
		required = true,
		...rest
	} = props;

	return (
		<TextInput
			label={label}
			type="text"
			inputMode="tel"
			required={required}
			autoComplete={autoComplete}
			{...rest}
		/>
	);
};
