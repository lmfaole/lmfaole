import { Radio } from "./radio.tsx";
import type { RadioGroupTypes } from "./radio-group.types.ts";

import "./radio.css";

export const RadioGroup = (props: RadioGroupTypes) => {
	return (
		<fieldset>
			<legend>{props.legend}</legend>
			{props.items.map((item) => (
				<Radio
					key={item}
					label={item}
					name={props.legend}
					defaultChecked={
						props.defaultValue ? item.includes(props.defaultValue) : false
					}
				/>
			))}
		</fieldset>
	);
};
