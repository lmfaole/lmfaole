import { alertInfo } from "./alert/alert.info.tsx";
import type { ComponentInfoType } from "./component.info.type.ts";

export const components: ComponentInfoType[] = [alertInfo];

export default components.sort((a, b) => a.name.localeCompare(b.name));
