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
		action = "button",
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
			data-action={action}
			{...rest}
		>
			{icon && iconPosition === "start" && icon}
			<span>
				{value} {accessKey && <b>[{accessKey}]</b>}
			</span>
			{icon && iconPosition === "end" && icon}
		</button>
	);
};

export const buttonInfo: ComponentInfoTypes = {
	name: "Button",
	category: "handling",
	examples: [
		{
			code: <Button value={"Knapp"} icon={<FaceSmileIcon />} />,
		},
		{
			title: "Ikke aktiv",
			code: <Button disabled value={"Ikke aktiv knapp"} />,
		},
		{
			title: "Sletteknapp",
			code: <Button action={"delete"} value={"Slett..."} />,
		},
		{
			title: "Ikke aktiv sletteknapp",
			code: <Button action={"delete"} value={"Slett..."} disabled />,
		},
		{
			title: "Med ikon",
			code: (
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
			code: (
				<Button disabled value={"Lagre"} icon={<DownloadIcon aria-hidden />} />
			),
		},
		{
			title: "Med snarvei",
			code: <Button accessKey={"S"} value={"Knapp med snarvei"} />,
		},
		{
			title: "Gruppe med knapper",
			code: (
				<ButtonGroup>
					<Button value={"Kopier"} icon={<ClipboardIcon />} />
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
						icon={<ArrowLeftIcon aria-hidden />}
						iconPosition={"start"}
					/>
					<Button value={"Neste"} icon={<ArrowRightIcon aria-hidden />} />
				</ButtonGroup>
			),
		},
		{
			title: "Gruppe med knapper i motsatt rekkefølge i pille",
			code: (
				<ButtonGroup reverse pill>
					<Button value={"Neste"} icon={<ArrowRightIcon aria-hidden />} />
					<Button
						value={"Forrige"}
						icon={<ArrowLeftIcon aria-hidden />}
						iconPosition={"start"}
					/>
				</ButtonGroup>
			),
		},
		{
			title: "Gruppe med grupper",
			code: (
				<ButtonGroup pill>
					<ButtonGroup>
						<Button value={"Lagre"} icon={<FloppydiskIcon aria-hidden />} />
						<Button value={"Lagre som..."} />
					</ButtonGroup>
					<ButtonGroup>
						<Button value={"Send"} icon={<EnvelopeOpenIcon aria-hidden />} />
					</ButtonGroup>
					<ButtonGroup>
						<Button action={"delete"} value={"Slett..."} />
					</ButtonGroup>
				</ButtonGroup>
			),
		},
	],
	spec: "https://html.spec.whatwg.org/#the-button-element",
};
