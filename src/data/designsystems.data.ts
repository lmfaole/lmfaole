export type DesignSystem = {
	name: string;
	href: string;
	description?: string;
};

export const carbon: DesignSystem = {
	name: "Carbon",
	description:
		"Carbon is IBM’s open source design system for products and digital experiences. With the IBM Design Language as its foundation, the system consists of working code, design tools and resources, human interface guidelines, and a vibrant community of contributors.",
	href: "https://carbondesignsystem.com/",
};

export const designSystems: DesignSystem[] = [carbon].sort((a, b) =>
	a.name.localeCompare(b.name),
);
