import type { ComponentInfo } from "../component-info.type.ts";
import { Button } from "./button.tsx";

export const buttonInfo: ComponentInfo = {
	name: "Knapp",
	example: <Button>Knapp</Button>,
	description:
		"The <button> HTML element is an interactive element activated by a user with a mouse, keyboard, finger, voice command, or other assistive technology. Once activated, it then performs an action, such as submitting a form or opening a dialog.",
	spec: "https://html.spec.whatwg.org/#the-button-element",
};
