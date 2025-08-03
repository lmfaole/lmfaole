import * as previousIcon from "../../aksel-icons/Arrows/ArrowLeft.svg";
import * as nextIcon from "../../aksel-icons/Arrows/ArrowRight.svg";
import * as downloadIcon from "../../aksel-icons/Files and application/CloudDown.svg";

import type { ComponentInfoTypes } from "../component-info.type.ts";
import type { ButtonTypes } from "./button.types.ts";
import { ButtonGroup } from "./button-group.tsx";

import "./button.css";

export const Button = (props: ButtonTypes) => {
	const {
		type = "button",
		accessKey,
		value,
		icon,
		iconPosition = "end",
		...rest
	} = props;

	return (
		<button
			type={type}
			title={props.title ? props.title : value.toString()}
			value={value}
			accessKey={accessKey}
			data-icon-position={iconPosition}
			{...rest}
		>
			{icon && iconPosition === "start" && (
				<img src={icon} alt={""} width={24} height={24} />
			)}
			{value} {accessKey && <b>[{accessKey}]</b>}
			{icon && iconPosition === "end" && (
				<img src={icon} alt={""} width={24} height={24} />
			)}
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
			title: "Ikke aktiv med ikon",
			description:
				"For å gjøre det enda klarere at en knapp ikke kan interagerer med fjernes ikonet",
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
					<Button
						value={"Forrige"}
						icon={previousIcon.default}
						iconPosition={"start"}
					/>
					<Button value={"Neste"} icon={nextIcon.default} />
				</ButtonGroup>
			),
		},
		{
			title: "Gruppe med knapper i motsatt rekkefølge i pille",
			code: (
				<ButtonGroup reverse pill>
					<Button value={"Neste"} icon={nextIcon.default} />
					<Button
						value={"Forrige"}
						icon={previousIcon.default}
						iconPosition={"start"}
					/>
				</ButtonGroup>
			),
		},
	],
	spec: "https://html.spec.whatwg.org/#the-button-element",
};
