import type { ComponentInfoType } from "../component.info.type.ts";
import { Alert } from "./alert.tsx";

export const alertInfo: ComponentInfoType = {
	name: "Alert",
	description:
		"An alert is an element that displays a brief, important message in a way that attracts the user's attention without interrupting the user's task. Dynamically rendered alerts are automatically announced by most screen readers, and in some operating systems, they may trigger an alert sound. It is important to note that, at this time, screen readers do not inform users of alerts that are present on the page before page load completes.",
	aliases: ["varsel"],
	examples: [
		<Alert message={"Denne siden er under oppbygging."} />,
		<Alert message={"Meldingen er sendt!"} type={"success"} />,
		<Alert
			message={"En feil har skjedd. Skru av og på igjen modemet ditt :("}
			type={"error"}
		/>,
	],
};
