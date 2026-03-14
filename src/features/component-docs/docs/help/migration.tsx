import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "iconPosition er utfaset",
        description: "Tekst vises ikke lenger ved siden av ikonet, og iconPosition har dermed ingen effekt. Propen kan fjernes.",
        deprecates: { name: "iconPosition", kind: "prop" },
        before: `<Help buttonText="Hjelp" iconPosition="right">
    Hjelpetekst her.
</Help>`,
        after: `<Help buttonText="Hjelp">
    Hjelpetekst her.
</Help>`,
    },
    {
        title: "showButtonText er utfaset",
        description: "Tekst vises ikke lenger ved siden av Help-ikonet. Trenger du synlig tekst, bruk en vanlig Button ved siden av.",
        uses: ["button"],
        deprecates: { name: "showButtonText", kind: "prop" },
        replacedBy: [{ name: "Button", kind: "component" }],
        before: `<Help buttonText="Hjelp" showButtonText>
    Hjelpetekst her.
</Help>`,
        after: `{/* Bruk Button for synlig tekst ved siden av: */}
<Flex gap="xs" alignItems="center">
    <Button variant="ghost" onClick={() => openHelpPanel()}>
        Åpne hjelpepanel
    </Button>
</Flex>`,
    },
];
