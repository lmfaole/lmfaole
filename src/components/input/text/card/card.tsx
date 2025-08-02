import { TextInput } from "../text.tsx";

export const CardInput = () => {
	return (
		<fieldset>
			<legend>Kortinformasjon</legend>

			<TextInput label={"Navn"} autoComplete={"cc-name"} />
			<TextInput label={"Utgår"} autoComplete={"cc-exp"} />
			<TextInput label={"CSV"} autoComplete={"cc-csc"} />
			<TextInput label={"Kredittkortnummer"} autoComplete={"cc-number"} />
		</fieldset>
	);
};
