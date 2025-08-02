import { useId } from "react";
import type { NumberInputTypes } from "./number.types.ts";

import "./number.css";

export const NumberInput = (props: NumberInputTypes) => {
	const id = useId();

	const {
		label,
		datalist,
		suffix,
		required = true,
		inputMode = "numeric",
		autoComplete = "on",
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
				autoComplete={autoComplete}
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
