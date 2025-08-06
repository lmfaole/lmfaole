import { CheckmarkIcon, XMarkIcon } from "@navikt/aksel-icons";
import { mockFlavors } from "../../component.mock.data.ts";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import type { CheckboxTypes } from "./checkbox.types.ts";
import { CheckboxGroup } from "./checkbox-group.tsx";

import "./checkbox.css";

export const Checkbox = (props: CheckboxTypes) => {
	const { label, checked, ...rest } = props;

	const name = props.name ? props.name : label;

	return (
		<label>
			<span className={"switch"} aria-hidden={"true"}>
				<span className={"toggle"}>
					<CheckmarkIcon className={"check"} />
					<XMarkIcon className={"cross"} />
				</span>
			</span>
			<input type="checkbox" checked={checked} name={name} {...rest} />
			<span className={"text"}>{label}</span>
		</label>
	);
};

export const checkboxInfo: ComponentInfoTypes = {
	name: "Checkbox",
	category: "skjema",
	base: <Checkbox label={mockFlavors[0]} />,
	examples: [
		{
			title: "Disabled",
			children: <Checkbox disabled label={mockFlavors[0]} />,
		},
		{
			title: "Avkrysningsbokser i fieldset",
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
