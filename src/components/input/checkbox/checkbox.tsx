import { CheckmarkIcon, XMarkIcon } from "@navikt/aksel-icons";
import { mockFlavors } from "../../component.mock.data.ts";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import type { CheckboxTypes } from "./checkbox.types.ts";
import { CheckboxGroup } from "./checkbox-group.tsx";

import "./checkbox.css";

export const Checkbox = (props: CheckboxTypes) => {
	const { label, checked, name, ...rest } = props;

	return (
		<label>
			<span className={"switch"}>
				<CheckmarkIcon className={"check"} />
				<XMarkIcon className={"cross"} />
			</span>
			<input
				type="checkbox"
				checked={checked}
				name={name ? name : label}
				{...rest}
			/>
			{label}
		</label>
	);
};

export const checkboxInfo: ComponentInfoTypes = {
	name: "Checkbox",
	category: "skjema",
	base: <Checkbox label={mockFlavors[0]} />,
	examples: [
		{
			title: "Switch",
			children: <Checkbox toggle label={mockFlavors[0]} defaultChecked />,
		},
		{
			title: "Ikke aktiv switch",
			children: (
				<Checkbox checked={true} toggle disabled label={mockFlavors[0]} />
			),
		},
		{
			title: "Switch reverse",
			children: <Checkbox toggle reverse label={mockFlavors[0]} />,
		},
		{
			title: "Switch reverse fullwidth",
			children: <Checkbox toggle reverse fullWidth label={mockFlavors[0]} />,
			restrict: false,
		},
		{
			title: "Avkrysningsbokser i fieldset",
			children: (
				<CheckboxGroup legend={"Hvilke smaker liker du?"}>
					{mockFlavors.map((flavor) => (
						<Checkbox label={flavor} />
					))}
				</CheckboxGroup>
			),
		},
		{
			title: "Avkrysningsbokser i gruppe",
			children: (
				<CheckboxGroup legend={"Filtrer smaker"}>
					{mockFlavors.map((flavor) => (
						<Checkbox label={flavor} />
					))}
				</CheckboxGroup>
			),
		},
	],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
