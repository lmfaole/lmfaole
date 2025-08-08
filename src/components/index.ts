import { switchInfo } from "./switch/switch.tsx";
import { tagInfo } from "./tag/tag.tsx";

export * from "./switch/switch.tsx";
export * from "./tag/tag.tsx";

export const components = [switchInfo, tagInfo];

export default components.sort((a, b) => a.name.localeCompare(b.name));
