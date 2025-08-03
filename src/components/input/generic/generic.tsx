import { useId } from "react";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import type { GenericTypes } from "./generic.types.ts";

export const GenericInput = (props: GenericTypes) => {
	const id = useId();

	const { label, datalist, suffix, name, required = true, ...rest } = props;

	const nameAttribute = name ? name : label;

	return (
		<>
			<label htmlFor={id}>{label}</label>
			<input
				{...rest}
				id={id}
				name={nameAttribute}
				required={required}
				list={datalist && `${label}-${id}`}
				aria-describedby={`${id}-desciption`}
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

export const genericInputInfo: ComponentInfoTypes = {
	name: "Generisk input",
	description:
		"Brukes for å håndtere vanlige input egenskaper som datalister og annet snacks.",
	category: "skjema",
	examples: [
		{
			code: <GenericInput label={"Hvilken smak ønsker du?"} required={false} />,
		},
	],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
