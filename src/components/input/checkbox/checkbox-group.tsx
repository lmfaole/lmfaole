import { Checkbox } from "./checkbox.tsx";
import type { CheckboxGroupTypes } from "./checkbox-group.types.ts";

import "./checkbox.css";

export const CheckboxGroup = (props: CheckboxGroupTypes) => {
	return (
		<fieldset>
			<legend>{props.legend}</legend>
			{props.items.map((item) => (
				<Checkbox
					key={item}
					label={item}
					name={props.legend}
					defaultChecked={
						props.defaultValues ? props.defaultValues.includes(item) : false
					}
				/>
			))}
		</fieldset>
	);
};
