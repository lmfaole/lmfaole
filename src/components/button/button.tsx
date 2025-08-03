import * as downloadIcon from "../../aksel-icons/Files and application/CloudDown.svg";

import type { ComponentInfoTypes } from "../component-info.type.ts";
import type { ButtonTypes } from "./button.types.ts";
import { ButtonGroup } from "./button-group.tsx";

import "./button.css";

export const Button = (props: ButtonTypes) => {
	const { type = "button", accessKey, value, icon, ...rest } = props;

	return (
		<button
			type={type}
			title={props.title ? props.title : value.toString()}
			value={value}
			accessKey={accessKey}
			{...rest}
		>
			{value} {accessKey && <b>[{accessKey}]</b>}
			{icon && <img src={icon} alt={""} width={24} height={24} />}
		</button>
	);
};

export const buttonInfo: ComponentInfoTypes = {
	name: "Button",
	category: "handling",
	examples: [
		{
			code: <Button value={"Knapp"} />,
		},
		{
			title: "Ikke aktiv",
			code: <Button disabled value={"Ikke aktiv knapp"} />,
		},
		{
			title: "Med ikon",
			code: <Button value={"Lagre"} icon={downloadIcon.default} />,
		},
		{
			title: "Med snarvei",
			code: <Button accessKey={"S"} value={"Knapp med snarvei"} />,
		},
		{
			title: "Gruppe med knapper",
			code: (
				<ButtonGroup>
					<Button value={"Kopier"} />
					<Button value={"Lim inn"} />
				</ButtonGroup>
			),
		},
		{
			title: "Gruppe med knapper i pille",
			code: (
				<ButtonGroup pill>
					<Button value={"Kopier"} />
					<Button value={"Lim inn"} />
				</ButtonGroup>
			),
		},
		{
			title: "Gruppe med knapper i motsatt rekkefølge",
			description:
				"Brukes i tilfeller der rekkefølgen i DOM-en og den visuelle rekkefølgen virker mot" +
				" hverandre. Bør ikke brukes ofte.",
			code: (
				<ButtonGroup reverse>
					<Button value={"Neste"} />
					<Button value={"Forrige"} />
				</ButtonGroup>
			),
		},
		{
			title: "Gruppe med knapper i motsatt rekkefølge i pille",
			code: (
				<ButtonGroup reverse pill>
					<Button value={"Neste"} />
					<Button value={"Forrige"} disabled />
				</ButtonGroup>
			),
		},
	],
	spec: "https://html.spec.whatwg.org/#the-button-element",
};
