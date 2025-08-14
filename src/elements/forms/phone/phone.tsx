import { useId } from "react";
import type { ElementInfoType } from "../../element-info.type.ts";
import type { PhoneType } from "./phone.type.ts";

export const Phone = (props: PhoneType) => {
	const { label = "Telefon", autoComplete = "phone-national", ...rest } = props;
	const id = useId();

	return (
		<>
			<label htmlFor={label + id}>{label}</label>
			<input id={label + id} autoComplete={autoComplete} type="tel" {...rest} />
		</>
	);
};

export const phoneInputInfo: ElementInfoType = {
	name: "Phone",
	img: <Phone required={false} />,
	meta: {
		description:
			"The input element represents a control for editing a telephone number given in the element's value.",
		spec: "https://html.spec.whatwg.org/multipage/input.html#telephone-state-(type=tel)",
		category: "skjema",
		aka: ["telfon-input", "mobilnummer"],
	},
};
