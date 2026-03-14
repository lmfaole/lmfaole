import { Link } from "@fremtind/jokul/link";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import navLinkDoc from "../nav-link";
import linkListDoc from "../link-list";

const doc: ComponentDoc = {
    id: "link",
    name: "Link",
    package: "@fremtind/jokul/link",
    category: "Navigasjon",
    tags: ["navigasjon", "tekst", "interaktiv"],
    description: "Link er Jøkuls grunnleggende lenkestil for inline-lenker og frittstående lenker.",
    warnings: "Bruk Link for navigasjon, ikke Button — feil element bryter forventningene til tastaturbrukere og skjermlesere.",
    relatedIds: [navLinkDoc.id, linkListDoc.id],
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
