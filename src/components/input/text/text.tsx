import { useId } from "react";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import type { TextTypes } from "./text.types.ts";

export const TextInput = (props: TextTypes) => {
	const id = useId();

	const {
		label,
		datalist,
		suffix,
		list,
		autoComplete,
		required = true,
		...rest
	} = props;

	return (
		<>
			<label htmlFor={id}>{label}</label>
			<input
				id={id}
				type="text"
				name={label}
				required={required}
				list={`${label}-${id}`}
				aria-describedby={`${id}-desciption`}
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

export const textInputInfo: ComponentInfoTypes = {
	name: "Tekst",
	category: "skjemaelementer",
	examples: [{ code: <TextInput label={"Hva er nummeret ditt?"} /> }],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
