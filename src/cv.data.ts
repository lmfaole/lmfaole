type LanguageString = {
no: string;
en?: string;
}

type Degree = {
school: languageString;
name: languageString;
startDate: Date;
endDate: Date;
description?: languageString;
}

type Job = {
workplace: languageString;
position: languageString;
startDate: Date;
endDate: Date;
description?: languageString;
keywords?: string[];
}