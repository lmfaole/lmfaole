import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "Help viser ikke lenger tekst ved siden av ikonet",
        description: "iconPosition er utfaset fordi tekst ikke lenger vises. showButtonText er utfaset — bruk heller en vanlig Button ved siden av Help.",
        uses: ["button"],
        deprecates: [{ name: "iconPosition", kind: "prop" }, { name: "showButtonText", kind: "prop" }],
        replacedBy: [{ name: "Button", kind: "component" }],
        before: `<Help buttonText="Hjelp" iconPosition="right" showButtonText>
    Hjelpetekst her.
</Help>`,
        after: `<Help buttonText="Hjelp" position="right">
    Hjelpetekst her.
</Help>

{/* Vil du ha synlig tekst ved siden av? Bruk Button: */}
<Flex gap="xs" alignItems="center">
    <span>Trenger du hjelp?</span>
    <Button variant="ghost" onClick={() => openHelpPanel()}>
        Åpne hjelpepanel
    </Button>
</Flex>`,
    },
];
