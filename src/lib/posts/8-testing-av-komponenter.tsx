import React from "react";
import { UnorderedList, OrderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import type { BlogPost } from "./types";

const post: BlogPost = {
  id: 8,
  title: "Testing av komponenter med React Testing Library",
  excerpt: "Strategi og praksis for å teste Jøkul-komponenter og egne komposisjoner på en måte som speiler faktisk bruk.",
  content: (
    <>
      <p>
        <strong>React Testing Library (RTL)</strong> er det anbefalte testrammeverket for
        React-komponenter i Jøkul-økosystemet. Filosofien er enkel men kraftfull:{" "}
        <em>test oppførselen brukeren opplever, ikke implementasjonsdetaljene</em>. Dette gir
        tester som er robuste mot refaktorering og som faktisk verifiserer at produktet fungerer.
      </p>

      <Message variant="info">
        Jøkul-teamet bruker <strong>Vitest</strong> og RTL for alle komponenttester internt.
        Jest er et fullgodt alternativ med identisk RTL-integrasjon.
      </Message>

      <h2>Spørringsprioritet</h2>
      <p>
        RTL anbefaler en spesifikk prioritetsrekkefølge for å finne elementer, fra mest til
        minst tilgjengelighetsvennlig:
      </p>
      <DescriptionList>
        <DescriptionTerm><code>getByRole</code></DescriptionTerm>
        <DescriptionDetail>Første valg alltid. Speiler hvordan skjermlesere oppdager elementer. Eksempel: <code>{'getByRole("button", { name: "Send inn" })'}</code></DescriptionDetail>
        <DescriptionTerm><code>getByLabelText</code></DescriptionTerm>
        <DescriptionDetail>Ideell for skjemafelter. Finner input knyttet til en label. Tvinger deg til å ha labels, noe som er god tilgjengelighetspraksis.</DescriptionDetail>
        <DescriptionTerm><code>getByPlaceholderText</code></DescriptionTerm>
        <DescriptionDetail>Brukes unntaksvis. Placeholder er ikke en erstatning for label — bruk <code>getByLabelText</code> der det er mulig.</DescriptionDetail>
        <DescriptionTerm><code>getByText</code></DescriptionTerm>
        <DescriptionDetail>For ikke-interaktive elementer. Finn avsnitt, overskrifter og listeelemeneter med innholdet sitt.</DescriptionDetail>
        <DescriptionTerm><code>getByTestId</code></DescriptionTerm>
        <DescriptionDetail>Siste utvei. Brukes kun når ingen semantisk spørring er mulig. Krev begrunnelse i kodegjennomgang.</DescriptionDetail>
      </DescriptionList>

      <h2>userEvent vs fireEvent</h2>
      <p>
        Foretrekk alltid <code>userEvent</code> fremfor <code>fireEvent</code>. Forskjellen er
        at <code>userEvent</code> simulerer hele interaksjonssekvensen slik en ekte bruker ville
        utført den:
      </p>
      <pre><code>{`// Unngå — skyter kun ett enkelt DOM-event
fireEvent.click(button);

// Foretrekk — simulerer hover → focus → klikk → blur
await userEvent.click(button);

// For tekstinntasting simuler hele sekvensen
await userEvent.type(input, "Ola Nordmann");`}</code></pre>

      <h2>Oppsett med jest-axe</h2>
      <OrderedList>
        <ListItem>Installer: <code>{'npm install --save-dev jest-axe'}</code></ListItem>
        <ListItem>Utvid Jest-typene: <code>{'import "jest-axe/extend-expect"'}</code></ListItem>
        <ListItem>Legg til en axe-sjekk i hver testfil for kritiske komponenter</ListItem>
        <ListItem>Vurder å lage en gjenbrukbar <code>renderAccessible</code>-hjelpefunksjon</ListItem>
        <ListItem>Kjør axe-tester i CI slik at tilgjengelighetsregresjoner oppdages automatisk</ListItem>
      </OrderedList>

      <h2>Hva du IKKE bør teste</h2>
      <UnorderedList>
        <ListItem>Interne tilstandsvariabler — test brukersynlig oppførsel i stedet</ListItem>
        <ListItem>CSS-klassenavn — disse er implementasjonsdetaljer som kan endre seg</ListItem>
        <ListItem>Prop-typer — TypeScript håndterer dette på kompileringstidspunktet</ListItem>
        <ListItem>Selve Jøkul-komponentene — de testes allerede av Jøkul-teamet</ListItem>
      </UnorderedList>

      <ExpandablePanel>
        <ExpandablePanel.Header>Komplett testeksempel med RTL og jest-axe</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <pre><code>{`import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

describe("Kontaktskjema", () => {
  it("sender skjema og viser bekreftelse", async () => {
    const { container } = render(<Kontaktskjema />);

    await userEvent.type(
      screen.getByLabelText("Navn"),
      "Ola Nordmann"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Send inn" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Takk for din henvendelse");
  });

  it("har ingen tilgjengelighetsfeil", async () => {
    const { container } = render(<Kontaktskjema />);
    expect(await axe(container)).toHaveNoViolations();
  });
});`}</code></pre>
        </ExpandablePanel.Content>
      </ExpandablePanel>
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
