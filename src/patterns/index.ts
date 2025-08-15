import { alertPatternInfo } from "./alert/alert.pattern.info.tsx";
import { alertDialogPatternInfo } from "./alert-dialog/alert-dialog.pattern.info.tsx";
import { breadcrumbInfo } from "./breadcrumb/breadcrumb.pattern.info.tsx";
import type { PatternInfoType } from "./pattern.info.type.ts";

export const patterns: PatternInfoType[] = [
	breadcrumbInfo,
	alertPatternInfo,
	alertDialogPatternInfo,
];

export default patterns.sort((a, b) => a.name.localeCompare(b.name));
