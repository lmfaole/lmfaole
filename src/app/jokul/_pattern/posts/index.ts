import iconButtonsPattern from "./ikonknapper";
import type { PatternPost } from "./types";

export type { PatternPost } from "./types";
export type { PatternId } from "./ids";

export const patternPosts: PatternPost[] = [
    iconButtonsPattern,
].sort((a, b) => a.title.localeCompare(b.title, "nb"));

