import { Checkbox } from "./checkbox.tsx";
import type { CheckboxGroupTypes } from "./checkbox-group.types.ts";

export const CheckboxGroup = (props: CheckboxGroupTypes) => {
	const { legend, defaultValues, required = true, items, ...rest } = props;

	return (
		<fieldset {...rest}>
			<legend>{legend}</legend>
			{items.map((item) => (
				<Checkbox
					required={required}
					key={item}
					label={item}
					name={legend}
					defaultChecked={defaultValues ? defaultValues.includes(item) : false}
				/>
			))}
		</fieldset>
	);
};
