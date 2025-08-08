import { breadcrumbInfo } from "./breadcrumb/breadcrumb.tsx";
import type { PatternType } from "./pattern.type.ts";

export const patternsList: PatternType[] = [breadcrumbInfo];

export default patternsList.sort((a, b) => a.name.localeCompare(b.name));
