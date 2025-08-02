import { useId } from "react";
import type { NumberTypes } from "./number.types.ts";

import "./number.css";

export const NumberInput = (props: NumberTypes) => {
	const id = useId();

	const {
		label,
		datalist,
		suffix,
		required = true,
		inputMode = "numeric",
		...rest
	} = props;

	return (
		<>
			<label htmlFor={id}>{label}</label>
			<input
				id={id}
				type="number"
				name={label}
				required={required}
				defaultValue={props.min}
				list={`${label}-${id}`}
				aria-describedby={`${id}-desciption`}
				inputMode={inputMode}
				{...rest}
			/>

			{suffix && (
				<span className="suffix" id={`${id}-desciption`}>
					{suffix}
				</span>
			)}

			{datalist && (
				<datalist id={`${label}-${id}`}>
					{datalist.map((item) => (
						<option key={item}>{item}</option>
					))}
				</datalist>
			)}
		</>
	);
};
