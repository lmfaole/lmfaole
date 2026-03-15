import type { PatternPost } from "../types";
import { DotsIllustration } from "@/shared/components/Illustration";

const post: PatternPost = {
    id: 1,
    title: "Ikonknapper",
    excerpt: "Kompakte handlinger med ikon, tydelig aria-label og riktig variant.",
    illustration: <DotsIllustration />,
    relatedComponents: ["button", "icon", "screen-reader-only"],
    relatedTokens: [10],
    content: () => import("./content.mdx"),
};

export default post;
