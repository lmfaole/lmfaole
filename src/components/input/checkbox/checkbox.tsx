import { mockFlavors } from "../../component.mock.data.ts";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import type { CheckboxTypes } from "./checkbox.types.ts";
import { CheckboxGroup } from "./checkbox-group.tsx";

import "./checkbox.css";
import { CheckmarkIcon, XMarkIcon } from "@navikt/aksel-icons";

export const Checkbox = (props: CheckboxTypes) => {
	const {
		label,
		checked,
		name,
		reverse = false,
		toggle = false,
		fullWidth = false,
		...rest
	} = props;

	return (
		<label
			data-toggle={toggle}
			data-reverse={reverse}
			data-full-width={fullWidth}
		>
			{toggle && (
				<span className={"toggle"}>
					<CheckmarkIcon className={"check"} />
					<XMarkIcon className={"cross"} />
				</span>
			)}
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
	examples: [
		{
			title: "Enkeltstående",
			code: <Checkbox label={mockFlavors[0]} />,
		},
		{
			title: "Avkrysningsbokser i gruppe",
			code: (
				<CheckboxGroup legend={"Checkbox"} items={mockFlavors.slice(0, 4)} />
			),
		},
		{
			title: "Switch",
			code: <Checkbox toggle label={mockFlavors[0]} />,
		},
		{
			title: "Ikke aktiv switch",
			code: <Checkbox toggle disabled label={mockFlavors[0]} />,
		},
		{
			title: "Switch reverse",
			code: <Checkbox toggle reverse label={mockFlavors[0]} />,
		},
		{
			title: "Switch reverse fullwidth",
			code: <Checkbox toggle reverse fullWidth label={mockFlavors[0]} />,
			restrict: false,
		},
	],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
