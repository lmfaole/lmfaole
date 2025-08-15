import type { ReactNode } from "react";

export type PreformattedTextType = {
	children: ReactNode;
	language?: "tsx" | "html";
};
