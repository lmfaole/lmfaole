import { alertPatternInfo } from "./alert/alert.pattern.info.tsx";
import { breadcrumbInfo } from "./breadcrumb/breadcrumb.pattern.info.tsx";
import type { PatternInfoType } from "./pattern.info.type.ts";

export const patterns: PatternInfoType[] = [breadcrumbInfo, alertPatternInfo];

export default patterns.sort((a, b) => a.name.localeCompare(b.name));
