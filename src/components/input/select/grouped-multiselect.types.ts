import type { GroupedSelectTypes } from "./grouped-select.types.ts";

export type GroupedMultiselectTypes = Omit<GroupedSelectTypes, "multiple">;
