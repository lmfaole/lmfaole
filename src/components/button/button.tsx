import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ClipboardIcon,
	DownloadIcon,
	EnvelopeOpenIcon,
	FaceSmileIcon,
	FloppydiskIcon,
} from "@navikt/aksel-icons";
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
	base: <Button value={"Knapp"} icon={<FaceSmileIcon />} />,
	examples: [
		{
			title: "Ikke aktiv",
			children: <Button disabled value={"Ikke aktiv knapp"} />,
		},
		{
			title: "Sletteknapp",
			children: <Button danger value={"Slett..."} />,
		},
		{
			title: "Ikke aktiv sletteknapp",
			children: <Button danger value={"Slett..."} disabled />,
		},
		{
			title: "Med ikon",
			children: (
				<Button
					value={"Lagre"}
					icon={<DownloadIcon aria-hidden />}
					accessKey={"W"}
				/>
			),
		},
		{
			title: "Ikke aktiv med ikon",
			description:
				"For å gjøre det enda klarere at en knapp ikke kan interagerer med fjernes ikonet",
			children: (
				<Button disabled value={"Lagre"} icon={<DownloadIcon aria-hidden />} />
			),
		},
		{
			title: "Med snarvei",
			children: <Button accessKey={"S"} value={"Knapp med snarvei"} />,
		},
		{
			title: "Gruppe med knapper",
			children: (
				<ButtonGroup>
					<Button value={"Kopier"} icon={<ClipboardIcon />} />
					<Button value={"Lim inn"} />
				</ButtonGroup>
			),
		},
		{
			title: "Gruppe med knapper i pille",
			children: (
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
			children: (
				<ButtonGroup reverse>
					<Button
						value={"Forrige"}
						icon={<ArrowLeftIcon aria-hidden />}
						iconPosition={"start"}
					/>
					<Button value={"Neste"} icon={<ArrowRightIcon aria-hidden />} />
				</ButtonGroup>
			),
		},
		{
			title: "Gruppe med grupper",
			children: (
				<ButtonGroup pill>
					<ButtonGroup>
						<Button value={"Lagre"} icon={<FloppydiskIcon aria-hidden />} />
						<Button value={"Lagre som..."} />
					</ButtonGroup>
					<ButtonGroup>
						<Button value={"Send"} icon={<EnvelopeOpenIcon aria-hidden />} />
					</ButtonGroup>
					<ButtonGroup>
						<Button danger value={"Slett..."} />
					</ButtonGroup>
				</ButtonGroup>
			),
		},
	],
	spec: "https://html.spec.whatwg.org/#the-button-element",
};
