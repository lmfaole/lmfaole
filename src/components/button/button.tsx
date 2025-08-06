import { FaceSmileIcon } from "@navikt/aksel-icons";
import type { ComponentInfoTypes } from "../component-info.type.ts";
import type { ButtonTypes } from "./button.types.ts";
import { ButtonGroup } from "./button-group.tsx";

import "./button.css";

export const Button = (props: ButtonTypes) => {
	const {
		type = "button",
		danger = false,
		accessKey,
		icon,
		iconPosition = "end",
		children,
		...rest
	} = props;

	if (!children) {
		return <button>Mangler innhold</button>;
	}

	return (
		<button
			type={type}
			title={props.title ? props.title : children.toString()}
			accessKey={accessKey}
			data-icon-position={iconPosition}
			data-danger={danger}
			{...rest}
		>
			{icon && iconPosition === "start" && icon}
			{children}
			{icon && iconPosition === "end" && icon}
		</button>
	);
};

export const buttonInfo: ComponentInfoTypes = {
	name: "Knapp",
	category: "handling",
	description: "Relativt selvforklarende eller?",
	base: <Button>Hei</Button>,
	examples: [
		{
			title: "Ikke aktiv",
			children: <Button disabled>Knapp</Button>,
		},
		{
			title: "Sletteknapp",
			children: <Button danger>Slett</Button>,
		},
		{
			title: "Ikke aktiv sletteknapp",
			children: (
				<Button danger disabled>
					Slett
				</Button>
			),
		},
		{
			title: "Med ikon",
			children: <Button icon={<FaceSmileIcon />}>Hei</Button>,
		},
		{
			title: "Ikke aktiv med ikon",
			children: (
				<Button disabled icon={<FaceSmileIcon />}>
					Hei
				</Button>
			),
		},
		{
			title: "Med snarvei",
			children: <Button accessKey={"S"}>Hei</Button>,
		},
		{
			title: "Gruppe med knapper",
			children: (
				<ButtonGroup>
					<Button>Kopier</Button>
					<Button>Lim inn</Button>
				</ButtonGroup>
			),
		},
		{
			title: "Gruppe med knapper i pille",
			children: (
				<ButtonGroup pill>
					<Button>Kopier</Button>
					<Button>Lim inn</Button>
				</ButtonGroup>
			),
		},
		{
			title: "Gruppe med knapper i motsatt rekkefølge",
			description:
				"Brukes i tilfeller der rekkefølgen i DOM-en og den visuelle rekkefølgen virker mot" +
				" hverandre. Bør ikke brukes ofte.",
			children: (
				<ButtonGroup reverse>
					<Button>Kopier</Button>
					<Button>Lim inn</Button>
				</ButtonGroup>
			),
		},
		{
			title: "Gruppe med grupper",
			children: (
				<ButtonGroup pill>
					<ButtonGroup>
						<Button>Kopier</Button>
						<Button>Lim inn</Button>
					</ButtonGroup>
					<ButtonGroup>
						<Button>Send</Button>
					</ButtonGroup>
					<ButtonGroup>
						<Button danger>Slett</Button>
					</ButtonGroup>
				</ButtonGroup>
			),
		},
	],
	spec: "https://html.spec.whatwg.org/#the-button-element",
};
