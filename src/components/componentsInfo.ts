import { buttonInfo } from "./button";
import { detailsInfo } from "./details";
import {
	checkboxInfo,
	numberInputInfo,
	radioInfo,
	selectInfo,
	telInputInfo,
	textInputInfo,
} from "./input";
import { resizerInfo } from "./layout/resizer/resizer.tsx";

const componentList = [
	buttonInfo,
	detailsInfo,
	checkboxInfo,
	numberInputInfo,
	radioInfo,
	selectInfo,
	telInputInfo,
	textInputInfo,
	resizerInfo,
];
export default componentList.sort((a, b) => a.name.localeCompare(b.name));
