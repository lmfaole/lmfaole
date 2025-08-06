import { mockFlavors } from "../../component.mock.data.ts";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import { Checkbox } from "../checkbox";
import type { SwitchTypes } from "./switch.types.ts";
import { SwitchGroup } from "./switch-group.tsx";

import "./switch.css";

export const Switch = (props: SwitchTypes) => {
	const { label, reverse = false, fullWidth = false, ...rest } = props;

	return (
		<Checkbox
			label={label}
			switch
			data-switch="true"
			data-reverse={reverse}
			data-full-width={fullWidth}
			{...rest}
		/>
	);
};

export const switchInfo: ComponentInfoTypes = {
	name: "Switch",
	category: "skjema",
	base: <Switch label={mockFlavors[0]} />,
	examples: [
		{
			title: "Ikke aktiv switch",
			children: <Switch checked={true} disabled label={mockFlavors[0]} />,
		},
		{
			title: "Switch reverse",
			children: <Switch reverse label={mockFlavors[0]} />,
		},
		{
			title: "Switch reverse fullwidth",
			children: <Switch reverse fullWidth label={mockFlavors[0]} />,
			restrict: false,
		},
		{
			title: "Switch reverse fullwidth i gruppe",
			children: (
				<SwitchGroup legend={"Innstillinger"}>
					{mockFlavors.map((flavor) => (
						<Switch reverse fullWidth label={flavor} />
					))}
				</SwitchGroup>
			),
			restrict: false,
		},
	],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
