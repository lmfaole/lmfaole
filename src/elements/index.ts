import { buttonInfo } from "./button/button.tsx";
import { codeInfo } from "./code/code.tsx";
import { detailsInfo } from "./details/details.tsx";
import type { ElementInfoType } from "./element-info.type.ts";
import { checkboxInfo } from "./inputs/checkbox/checkbox.tsx";
import { numberInputInfo } from "./inputs/number/number.tsx";
import { phoneInputInfo } from "./inputs/phone/phone.tsx";
import { radioInfo } from "./inputs/radio/radio.tsx";
import { searchInputInfo } from "./inputs/search/search.tsx";
import { textInputInfo } from "./inputs/text/text.tsx";
import { meterInfo } from "./meter/meter.tsx";
import { progressInfo } from "./progress/progress.tsx";
import { selectInfo } from "./select/select.tsx";

export * from "./button/button.tsx";
export * from "./code/code.tsx";
export * from "./details/details.tsx";
export * from "./inputs/checkbox/checkbox.tsx";
export * from "./inputs/number/number.tsx";
export * from "./inputs/phone/phone.tsx";
export * from "./inputs/radio/radio.tsx";
export * from "./inputs/search/search.tsx";
export * from "./inputs/text/text.tsx";
export * from "./meter/meter.tsx";
export * from "./progress/progress.tsx";
export * from "./select/select.tsx";

export const elements: ElementInfoType[] = [
	buttonInfo,
	detailsInfo,
	meterInfo,
	progressInfo,
	checkboxInfo,
	codeInfo,
	numberInputInfo,
	phoneInputInfo,
	radioInfo,
	searchInputInfo,
	selectInfo,
	textInputInfo,
];

export default elements.sort((a, b) => a.name.localeCompare(b.name));
