import type { ComponentDoc } from "../types";
import { props } from "./props";
import { LinkPreview } from "./preview";

const doc: ComponentDoc = {
    id: "link",
    name: "Link",
    package: "@fremtind/jokul/link",
    category: "Navigasjon",
    description: "Link er Jøkuls grunnleggende lenkestil for inline-lenker og frittstående lenker.",
    warnings: "Bruk Link for navigasjon, ikke Button — feil element bryter forventningene til tastaturbrukere og skjermlesere.",
    relationships: {
        alternatives: [{ id: "link-list", description: "Bruk LinkList når flere relaterte lenker bør grupperes under en felles overskrift." }, { id: "nav-link", description: "Bruk NavLink for sidefelts- eller menynavigasjonselementer som fremhever aktiv rute." }],
    },
    preview: <LinkPreview />,

    props,
};

export default doc;
