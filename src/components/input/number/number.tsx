import { useId } from "react";
import type { NumberInputTypes } from "./number.types.ts";

export const NumberInput = (props: NumberInputTypes) => {
	const id = useId();

	const {
		label,
		datalist,
		suffix,
		size = 10,
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
				size={size}
				list={datalist && `${label}-${id}`}
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
