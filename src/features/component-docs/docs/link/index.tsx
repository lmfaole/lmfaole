import { Link } from "@fremtind/jokul/link";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

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
    preview: (
        <Flex direction="column" gap="xs">
            <Link href="#">Les mer om bilforsikring</Link>
            <Link href="#" external>Åpne i ny fane</Link>
        </Flex>
    ),

    props,
    examples,
};

export default doc;
