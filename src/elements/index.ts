import type { ElementInfoType } from "./element-info.type.ts";

import { buttonInfo } from "./forms/button/button.tsx";
import { checkboxInfo } from "./forms/checkbox/checkbox.tsx";
import { meterInfo } from "./forms/meter/meter.tsx";
import { numberInputInfo } from "./forms/number/number.tsx";
import { phoneInputInfo } from "./forms/phone/phone.tsx";
import { progressInfo } from "./forms/progress/progress.tsx";
import { radioInfo } from "./forms/radio/radio.tsx";
import { rangeInfo } from "./forms/range/range.tsx";
import { searchInputInfo } from "./forms/search/search.tsx";
import { selectInfo } from "./forms/select/select.tsx";
import { textInputInfo } from "./forms/text/text.tsx";
import { blockquoteInfo } from "./grouping/blockquote/blockquote.tsx";
import { descriptionListInfo } from "./grouping/dl/dl.tsx";
import { listItemInfo } from "./grouping/li/li.tsx";
import { menuInfo } from "./grouping/menu/menu.tsx";
import { orderedListInfo } from "./grouping/ol/ol.tsx";
import { preInfo } from "./grouping/pre/pre.tsx";
import { unorderedListInfo } from "./grouping/ul/ul.tsx";
import { detailsInfo } from "./interactive/details/details.tsx";
import { tableInfo } from "./tabular-data/table/table.tsx";

export * from "./forms/button/button.tsx";
export * from "./forms/checkbox/checkbox.tsx";
export * from "./forms/meter/meter.tsx";
export * from "./forms/number/number.tsx";
export * from "./forms/phone/phone.tsx";
export * from "./forms/progress/progress.tsx";
export * from "./forms/radio/radio.tsx";
export * from "./forms/range/range.tsx";
export * from "./forms/search/search.tsx";
export * from "./forms/select/select.tsx";
export * from "./forms/text/text.tsx";
export * from "./grouping/blockquote/blockquote.tsx";
export * from "./grouping/dl/dl.tsx";
export * from "./grouping/li/li.tsx";
export * from "./grouping/menu/menu.tsx";
export * from "./grouping/ol/ol.tsx";
export * from "./grouping/pre/pre.tsx";
export * from "./grouping/ul/ul.tsx";
export * from "./interactive/details/details.tsx";
export * from "./tabular-data/table/table.tsx";

export const elements: ElementInfoType[] = [
	buttonInfo,
	detailsInfo,
	meterInfo,
	progressInfo,
	checkboxInfo,
	preInfo,
	numberInputInfo,
	phoneInputInfo,
	radioInfo,
	searchInputInfo,
	selectInfo,
	textInputInfo,
	blockquoteInfo,
	menuInfo,
	unorderedListInfo,
	orderedListInfo,
	listItemInfo,
	rangeInfo,
	descriptionListInfo,
	tableInfo,
];

export default elements.sort((a, b) => a.name.localeCompare(b.name));

/*.sort((a, b) => a.meta.category.localeCompare(b.meta.category));*/
