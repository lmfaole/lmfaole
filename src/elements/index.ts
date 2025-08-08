import { buttonInfo } from "./button/button.tsx";
import { codeInfo } from "./code/code.tsx";
import { detailsInfo } from "./details/details.tsx";
import type { ElementInfoType } from "./element-info.type.ts";
import { checkboxInfo } from "./input-checkbox/checkbox.tsx";
import { numberInputInfo } from "./input-number/number.tsx";
import { phoneInputInfo } from "./input-phone/phone.tsx";
import { radioInfo } from "./input-radio/radio.tsx";
import { searchInputInfo } from "./input-search/search.tsx";
import { textInputInfo } from "./input-text/text.tsx";
import { meterInfo } from "./meter/meter.tsx";
import { progressInfo } from "./progress/progress.tsx";
import { selectInfo } from "./select/select.tsx";

export * from "./button/button.tsx";
export * from "./code/code.tsx";
export * from "./details/details.tsx";
export * from "./input-checkbox/checkbox.tsx";
export * from "./input-number/number.tsx";
export * from "./input-phone/phone.tsx";
export * from "./input-radio/radio.tsx";
export * from "./input-search/search.tsx";
export * from "./input-text/text.tsx";
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
