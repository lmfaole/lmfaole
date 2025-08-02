import { TextInput } from "../text.tsx";

export const CardInput = () => {
	return (
		<fieldset>
			<legend>Kortinformasjon</legend>

			<TextInput label={"Navn"} autoComplete={"cc-name"} size={30} />
			<TextInput
				label={"Kredittkortnummer"}
				autoComplete={"cc-number"}
				size={15}
			/>
			<TextInput label={"Utgår"} autoComplete={"cc-exp"} type="month" />
			<TextInput label={"CSV"} autoComplete={"cc-csc"} size={3} />
		</fieldset>
	);
};
