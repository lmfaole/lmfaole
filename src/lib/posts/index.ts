import post1 from "./1-velkommen-til-jokul";
import post2 from "./2-hvordan-bruke-komponenter";
import post3 from "./3-fremtidens-design";
import post4 from "./4-tilgjengelighet-er-ikke-valgfritt";
import post5 from "./5-typografi-i-jokul";
import post6 from "./6-fargesystemet-i-jokul";
import post7 from "./7-ikoner-i-jokul";
import post8 from "./8-testing-av-komponenter";
import post9 from "./9-spacing-og-layout";
import type { BlogPost } from "./types";

export type { BlogPost, Resource } from "./types";
export { foundationalPosts } from "./foundational";

export const blogPosts: BlogPost[] = [
    post1,
    post2,
    post3,
    post4,
    post5,
    post6,
    post7,
    post8,
    post9,
].sort((a, b) => a.id - b.id);
