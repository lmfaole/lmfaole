export type LanguageString = {
	no: string;
	en?: string;
};

export type Degree = {
	school: LanguageString;
	name: LanguageString;
	description?: LanguageString;
	startDate: Date;
	endDate: Date;
};

export type Job = {
	workplace: LanguageString;
	position: LanguageString;
	description?: LanguageString;
	startDate: Date;
	endDate: Date;
	keywords?: string[];
};
