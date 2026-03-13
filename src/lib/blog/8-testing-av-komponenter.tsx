import React from "react";
import { UnorderedList, OrderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { CodeBlock } from "@/components/CodeBlock";
import type { BlogPost } from "./types";

const post: BlogPost = {
  id: 8,
  title: "Testing av komponenter med React Testing Library",
  excerpt: "Strategi og praksis for å teste Jøkul-komponenter og egne komposisjoner på en måte som speiler faktisk bruk.",
  content: (
    <>
      <p>
        Vi hadde en komponent som alltid var grønn i CI. Hundre prosent testdekning. Stolt av den
        var vi. Så gikk det i produksjon og én bruker klarte ikke å sende inn skjemaet sitt fordi
        feilmeldingene aldri ble synlige for skjermlesere. Testene hadde sjekket at komponentene
        rendret riktig HTML — men ingen hadde sjekket det brukeren faktisk opplever. Det var
        lekkepunktet i filosofien vår.
      </p>

      <Message variant="info">
        Jøkul-teamet bruker <strong>Vitest</strong> og React Testing Library internt.
        Jest fungerer like bra — API-ene er identiske.
      </Message>

      <h2>Spørringsprioritet — følg rekkefølgen</h2>
      <p>
        RTL er bygget rundt én filosofi: <em>test det brukeren ser og opplever</em>. Det betyr
        at du skal bruke spørringer som speiler hvordan skjermlesere og faktiske brukere
        navigerer siden. Prioritetsrekkefølgen er ikke valgfri:
      </p>
      <DescriptionList>
        <DescriptionTerm><code>getByRole</code></DescriptionTerm>
        <DescriptionDetail>Alltid første valg. Speiler skjermlesernavigasjon. <code>{'getByRole("button", { name: "Send inn" })'}</code></DescriptionDetail>
        <DescriptionTerm><code>getByLabelText</code></DescriptionTerm>
        <DescriptionDetail>For skjemafelter. Tvinger deg til å ha labels — god tilgjengelighetspraksis som bieffekt.</DescriptionDetail>
        <DescriptionTerm><code>getByText</code></DescriptionTerm>
        <DescriptionDetail>For ikke-interaktive elementer. Avsnitt, overskrifter, listeinnhold.</DescriptionDetail>
        <DescriptionTerm><code>getByTestId</code></DescriptionTerm>
        <DescriptionDetail>Siste utvei. Krev begrunnelse i code review. Tyder på at noe er feil med HTML-semantikken.</DescriptionDetail>
      </DescriptionList>

      <h2>userEvent er ikke det samme som fireEvent</h2>
      <p>
        Jeg brukte <code>fireEvent.click()</code> i lang tid. Det er ikke feil — men det er
        ikke hva brukeren gjør. En bruker klikker ikke bare ett DOM-event; de hovrer, fokuserer,
        klikker og blurrer. <code>userEvent</code> simulerer hele sekvensen:
      </p>
      <CodeBlock code={`// Unngå
fireEvent.click(button);

// Foretrekk — simulerer hele interaksjonssekvensen
await userEvent.click(button);

// For tekstinntasting
await userEvent.type(input, "Ola Nordmann");`} />

      <h2>jest-axe — tilgjengelighet i CI</h2>
      <OrderedList>
        <ListItem>Installer: <code>{'npm install --save-dev jest-axe'}</code></ListItem>
        <ListItem>Importer og utvid: <code>{'import "jest-axe/extend-expect"'}</code></ListItem>
        <ListItem>Legg til <code>axe(container)</code> i kritiske komponent-tester</ListItem>
        <ListItem>Kjør i CI — tilgjengelighetsregresjoner fanges automatisk</ListItem>
      </OrderedList>

      <h2>Hva du IKKE skal teste</h2>
      <UnorderedList>
        <ListItem>Interne tilstandsvariabler — test brukersynlig oppførsel</ListItem>
        <ListItem>CSS-klassenavn — implementasjonsdetaljer som kan endre seg fritt</ListItem>
        <ListItem>Prop-typer — TypeScript håndterer dette på kompileringstidspunktet</ListItem>
        <ListItem>Selve Jøkul-komponentene — Jøkul-teamet har det ansvaret</ListItem>
      </UnorderedList>

      <ExpandablePanel>
        <ExpandablePanel.Header>Testeksempel som faktisk fanget en ekte bug</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            Her er et komprimert eksempel fra kodebasen vår. Testen fanger akkurat feilen vi hadde
            i produksjon — at feilmeldinger ikke ble kunngjort til skjermlesere:
          </p>
          <CodeBlock code={`import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

describe("Kontaktskjema", () => {
  it("viser og kunngjør feilmelding ved tomt navn", async () => {
    render(<Kontaktskjema />);

    await userEvent.click(
      screen.getByRole("button", { name: "Send inn" })
    );

    // Sjekker at feilmeldingen er synlig OG tilgjengelig
    const error = screen.getByRole("alert");
    expect(error).toHaveTextContent("Navn er påkrevd");
  });

  it("har ingen tilgjengelighetsfeil", async () => {
    const { container } = render(<Kontaktskjema />);
    expect(await axe(container)).toHaveNoViolations();
  });
});`} />
          <p>
            Legg merke til <code>getByRole("alert")</code> — det tester at meldingen faktisk
            bruker riktig ARIA-rolle, ikke bare at den er i DOM-en. Det er forskjellen.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <p>
        Hundre prosent testdekning er ikke et mål — det er et tall. Målet er at testene dine
        fanger de feilene som faktisk skader brukere. Tenk på hvem som bruker løsningen din
        og skriv tester som verifiserer at de faktisk kan bruke den.
      </p>
    </>
  ),
  date: "2026-03-05",
  category: "Utvikling",
  author: "Ingrid Berg",
  tags: ["testing", "react testing library", "jest", "vitest", "tilgjengelighet"],
  resources: [
    {
      title: "React Testing Library",
      url: "https://testing-library.com/docs/react-testing-library/intro/",
      description: "Offisiell dokumentasjon for React Testing Library",
    },
    {
      title: "Common mistakes with RTL",
      url: "https://kentcdodds.com/blog/common-mistakes-with-react-testing-library",
      description: "Kent C. Dodds om de vanligste feilene med React Testing Library",
    },
    {
      title: "jest-axe",
      url: "https://github.com/nickcolley/jest-axe",
      description: "Integrer axe-core tilgjengelighetstester i Jest",
    },
  ],
};

export default post;
