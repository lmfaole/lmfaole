import type { ElementInfoType } from "../../element-info.type.ts";
import type { PhoneType } from "./phone.type.ts";

export const Phone = (props: PhoneType) => {
	const {
		label = "Telefonnummer",
		autoComplete = "phone-national",
		size = 12,
		...rest
	} = props;

	return (
		<label>
			{label}
			<input {...rest} autoComplete={autoComplete} size={size} type="tel" />
		</label>
	);
};

export const phoneInputInfo: ElementInfoType = {
	name: "Phone",
	img: <Phone required={false} />,
};
