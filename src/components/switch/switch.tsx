import { CheckmarkIcon, XMarkIcon } from "@navikt/aksel-icons";
import { checkboxInfo } from "../../elements";
import { mockFlavors } from "../component.mock.data.ts";
import type { ComponentInfoType } from "../component-info.type.ts";
import type { SwitchType } from "./switch.type.ts";

import "./switch.css";

export const Switch = (props: SwitchType) => {
	const { label, ...rest } = props;

	return (
		<label className={"switch"}>
			<span className={"toggle"} aria-hidden={"true"}>
				<span className={"icon"}>
					<CheckmarkIcon className={"check"} />
					<XMarkIcon className={"cross"} />
				</span>
			</span>
			<input {...rest} type="checkbox" data-switch="true" />
			<span className={"text"}>{label}</span>
		</label>
	);
};

export const switchInfo: ComponentInfoType = {
	name: "Switch",
	category: "skjema",
	example: <Switch label={mockFlavors[0]} />,
	builtOn: [checkboxInfo.name],
};
