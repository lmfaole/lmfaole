import type { ElementInfoType } from "./element.info.type.ts";
import { buttonInfo } from "./forms/button/button.info.ts";
import { inputCheckboxInfo } from "./forms/input-checkbox/input-checkbox.info.ts";
import { inputNumberInfo } from "./forms/input-number/input-number.info.ts";
import { inputRadioInfo } from "./forms/input-radio/input-radio.info.ts";
import { inputRangeInfo } from "./forms/input-range/input-range.info.ts";
import { inputSearchInfo } from "./forms/input-search/input-search.info.ts";
import { inputTelInfo } from "./forms/input-tel/input-tel.info.ts";
import { inputTextInfo } from "./forms/input-text/input-text.info.ts";
import { meterInfo } from "./forms/meter/meter.info.ts";
import { progressInfo } from "./forms/progress/progress.info.ts";
import { selectInfo } from "./forms/select/select.info.ts";
import { blockquoteInfo } from "./grouping/blockquote/blockquote.info.ts";
import { descriptionListInfo } from "./grouping/description-list/description-list.info.ts";
import { listItemInfo } from "./grouping/list-item/list-item.info.ts";
import { menuInfo } from "./grouping/menu/menu.info.ts";
import { orderedListInfo } from "./grouping/ordered-list/ordered-list.info.ts";
import { preformattedTextInfo } from "./grouping/preformatted-text/preformatted-text.info.ts";
import { unorderedListInfo } from "./grouping/unordered-list/unordered-list.info.ts";
import { detailsInfo } from "./interactive/details/details.info.ts";
import { tableInfo } from "./tabular-data/table/table.info.ts";

export * from "./forms/button/button.tsx";
export * from "./forms/input-checkbox/input-checkbox.tsx";
export * from "./forms/input-number/input-number.tsx";
export * from "./forms/input-radio/input-radio.tsx";
export * from "./forms/input-range/input-range.tsx";
export * from "./forms/input-search/input-search.tsx";
export * from "./forms/input-tel/input-tel.tsx";
export * from "./forms/input-text/input-text.tsx";
export * from "./forms/meter/meter.tsx";
export * from "./forms/progress/progress.tsx";
export * from "./forms/select/select.tsx";
export * from "./grouping/blockquote/blockquote.tsx";
export * from "./grouping/description-list/description-list.tsx";
export * from "./grouping/list-item/list-item.tsx";
export * from "./grouping/menu/menu.tsx";
export * from "./grouping/ordered-list/ordered-list.tsx";
export * from "./grouping/preformatted-text/preformatted-text.tsx";
export * from "./grouping/unordered-list/unordered-list.tsx";
export * from "./interactive/details/details.tsx";
export * from "./tabular-data/table/table.tsx";

export const elements: ElementInfoType[] = [
	buttonInfo,
	detailsInfo,
	meterInfo,
	progressInfo,
	inputCheckboxInfo,
	preformattedTextInfo,
	inputNumberInfo,
	inputTelInfo,
	inputRadioInfo,
	inputSearchInfo,
	selectInfo,
	inputTextInfo,
	blockquoteInfo,
	menuInfo,
	unorderedListInfo,
	orderedListInfo,
	listItemInfo,
	inputRangeInfo,
	descriptionListInfo,
	tableInfo,
];

export default elements.sort((a, b) => a.name.localeCompare(b.name));

/*.sort((a, b) => a.meta.category.localeCompare(b.meta.category));*/
