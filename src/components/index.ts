import { buttonInfo } from "./button";
import { detailsInfo } from "./details";
import { codeExampleInfo, componentExampleInfo } from "./documentation";
import {
	checkboxInfo,
	numberInputInfo,
	radioInfo,
	searchInputInfo,
	selectInfo,
	switchInfo,
	telInputInfo,
	textInputInfo,
} from "./input";
import { resizerInfo } from "./layout";

export const componentList = [
	buttonInfo,
	detailsInfo,
	checkboxInfo,
	numberInputInfo,
	radioInfo,
	selectInfo,
	telInputInfo,
	textInputInfo,
	resizerInfo,
	searchInputInfo,
	switchInfo,
	codeExampleInfo,
	componentExampleInfo,
];

export * from "./button";
export * from "./details";
export * from "./documentation";
export * from "./input";
export * from "./layout";

export default componentList.sort((a, b) => a.name.localeCompare(b.name));
