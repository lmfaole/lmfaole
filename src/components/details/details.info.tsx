import type { ComponentInfo } from "../component-info.type.ts";
import { Details } from "./details.tsx";

export const detailsInfo: ComponentInfo = {
	name: "Details",
	example: <Details summary={"React"}>Detaljer</Details>,
	spec: "https://html.spec.whatwg.org/#the-details-element",
};
