import typographyPost from "./typography";
import colorsPost from "./colors";
import spacingPost from "./spacing";
import motionPost from "./motion";
import breakpointsPost from "./breakpoints";
import type { FoundationalPost } from "./types";

export type { FoundationalPost };
export const foundationalPosts: FoundationalPost[] = [typographyPost, colorsPost, spacingPost, motionPost, breakpointsPost];
