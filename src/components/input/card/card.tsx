import { TextInput } from "../text/text.tsx";
import { CardNumberInput } from "./card-number.tsx";

export const CardInput = () => {
	return (
		<fieldset>
			<legend>Kortinformasjon</legend>

			<TextInput label={"Navn"} autoComplete={"cc-name"} />
			<TextInput label={"Utgår"} autoComplete={"cc-exp"} type={"month"} />
			<TextInput label={"CSV"} autoComplete={"cc-csc"} pattern={"\d\d\d"} />
			<CardNumberInput />
		</fieldset>
	);
};
