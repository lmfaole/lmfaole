import type { PatternInfoType } from "../pattern.info.type.ts";
import { AlertDialogPatternExample } from "./alert-dialog.pattern.example.tsx";

export const alertDialogPatternInfo: PatternInfoType = {
	name: "Alert Dialog (Ikke fungerende)",
	description:
		"An alert dialog is a modal dialog that interrupts the user's workflow to communicate an important message and acquire a response. Examples include action confirmation prompts and error message confirmations. The alertdialog role enables assistive technologies and browsers to distinguish alert dialogs from other dialogs so they have the option of giving alert dialogs special treatment, such as playing a system alert sound.\n" +
		"\n",
	source: {
		href: "https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/",
		label: "W3C Web Accessibility Initiative (WAI)",
	},
	implementation: <AlertDialogPatternExample />,
};
