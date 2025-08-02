import { Radio } from "./radio.tsx";
import type { RadioGroupTypes } from "./radio-group.types.ts";

export const RadioGroup = (props: RadioGroupTypes) => {
	const { legend, defaultValue, required = true, items, ...rest } = props;

	return (
		<fieldset {...rest}>
			<legend>{props.legend}</legend>
			{props.items.map((item) => (
				<Radio
					required={required}
					key={item}
					label={item}
					name={legend}
					defaultChecked={defaultValue ? item.includes(defaultValue) : false}
				/>
			))}
		</fieldset>
	);
};
