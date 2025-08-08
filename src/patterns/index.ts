import { breadcrumbInfo } from "./breadcrumb/breadcrumb.tsx";
import type { PatternType } from "./pattern.type.ts";

export const patterns: PatternType[] = [breadcrumbInfo];

export default patterns.sort((a, b) => a.name.localeCompare(b.name));
