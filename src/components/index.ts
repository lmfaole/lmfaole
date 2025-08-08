import { buttonInfo } from "./button";
import { detailsInfo } from "./details";
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

export const componentList = [
	buttonInfo,
	detailsInfo,
	checkboxInfo,
	numberInputInfo,
	radioInfo,
	selectInfo,
	telInputInfo,
	textInputInfo,
	searchInputInfo,
	switchInfo,
];

export * from "./button";
export * from "./details";
export * from "./documentation";
export * from "./input";

export default componentList.sort((a, b) => a.name.localeCompare(b.name));
