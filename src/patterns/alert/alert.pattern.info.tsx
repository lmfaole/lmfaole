import { alertInfo } from "../../components/alert/alert.info.tsx";
import { buttonInfo } from "../../elements/forms/button/button.info.ts";
import type { PatternInfoType } from "../pattern.info.type.ts";
import { AlertPatternExample } from "./alert.pattern.example.tsx";

export const alertPatternInfo: PatternInfoType = {
	name: "Alert",
	description:
		"An alert is an element that displays a brief, important message in a way that attracts the user's attention without interrupting the user's task. Dynamically rendered alerts are automatically announced by most screen readers, and in some operating systems, they may trigger an alert sound. It is important to note that, at this time, screen readers do not inform users of alerts that are present on the page before page load completes.",
	source: {
		href: "https://www.w3.org/WAI/ARIA/apg/patterns/alert/",
		label: "W3C Web Accessibility Initiative (WAI)",
	},
	implementation: <AlertPatternExample />,
	implementedUsingElements: [buttonInfo.name],
	implementedUsingComponents: [alertInfo.name],
};
