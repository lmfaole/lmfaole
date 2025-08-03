import { useId } from "react";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import type { SelectTypes } from "./select.types.ts";

import "./select.css";
import { mockFlavors, mockGroupedFlavors } from "../../component.mock.data.ts";
import { SelectGrouped } from "./select-grouped.tsx";

export const Select = (props: SelectTypes) => {
	const id = useId();

	const { items, label, required = true, ...rest } = props;

	return (
		<>
			<label htmlFor={id}>{label}</label>
			<select id={id} name={label} title={label} required={required} {...rest}>
				{props.items.map((item) => (
					<option key={item}>{item}</option>
				))}
			</select>
		</>
	);
};

export const selectInfo: ComponentInfoTypes = {
	name: "Select",
	category: "skjema",
	examples: [
		{
			code: <Select label={"Velg smak"} items={mockFlavors} />,
		},
		{
			title: "Ikke aktiv",
			code: <Select label={"Velg smak"} items={mockFlavors} disabled />,
		},
		{
			title: "Multiple select",
			code: <Select label={"Velg smaker"} items={mockFlavors} multiple />,
			description: "Nyttig ved flervalg. Duh.",
		},
		{
			title: "Gruppert select",
			code: <SelectGrouped label={"Velg smak"} groups={mockGroupedFlavors} />,
			description: (
				<p>
					Kan enkelt gruppere <strong>viktig innhold</strong>.
				</p>
			),
		},
		{
			title: "Multiple gruppert select",
			code: (
				<SelectGrouped
					label={"Velg smaker"}
					groups={mockGroupedFlavors}
					multiple
				/>
			),
		},
	],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
