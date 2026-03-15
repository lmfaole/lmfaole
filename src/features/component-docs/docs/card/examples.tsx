import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardImage } from "@fremtind/jokul/card";
import { Flex } from "@fremtind/jokul/flex";
import { Button } from "@fremtind/jokul/button";
import { Tag } from "@fremtind/jokul/tag";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


const CARD_VARIANTS = ["high", "low", "outlined"];


export function CardPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 3), 1200);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <Card variant={CARD_VARIANTS[step] as "high" | "low" | "outlined"}>
            <Flex direction="column" gap="s">
                <Tag variant="success">Aktiv</Tag>
                <h3>Bilforsikring</h3>
                <p>Kaskoforsikring — fornyes 1. januar 2025</p>
                <Button variant="secondary">Se detaljer</Button>
            </Flex>
        </Card>
    );
}

export function CardDetailPreview() {
    return (
        <Card padding="l" style={{ maxWidth: "28rem", width: "100%" }}>
            <Flex direction="column" gap="m">
                <Flex justifyContent="space-between" alignItems="center">
                    <h2>Bilforsikring kasko</h2>
                    <Tag variant="success">Aktiv</Tag>
                </Flex>
                <DescriptionList>
                    <DescriptionTerm>Registreringsnummer</DescriptionTerm>
                    <DescriptionDetail>AB 12345</DescriptionDetail>
                    <DescriptionTerm>Månedspremie</DescriptionTerm>
                    <DescriptionDetail>542 kr</DescriptionDetail>
                    <DescriptionTerm>Neste forfall</DescriptionTerm>
                    <DescriptionDetail>15. april 2026</DescriptionDetail>
                </DescriptionList>
                <Flex gap="s">
                    <Button>Endre dekning</Button>
                    <Button variant="ghost">Meld skade</Button>
                </Flex>
            </Flex>
        </Card>
    );
}

export function CardBasicPreview() {
    return (
        <Card padding="l">
            <Flex direction="column" gap="s">
                <h2>Tittel på kortet</h2>
                <p>Beskrivelse av innholdet i dette kortet.</p>
                <Flex gap="s">
                    <Button>Åpne</Button>
                    <Button variant="ghost">Mer info</Button>
                </Flex>
            </Flex>
        </Card>
    );
}

function BlogPostCardPreview() {
    return (
        <Card padding="l" style={{ maxWidth: "22rem", width: "100%" }}>
            <Flex direction="column" gap="s" style={{ paddingBlockStart: "var(--jkl-spacing-m)" }}>
                <h2>Typografi i Jøkul</h2>
                <p className="muted">
                    Hvordan Fremtind Grotesk bygger opp hierarki og lesbarhet på tvers av flater.
                </p>
            </Flex>
        </Card>
    );
}

function TokenCardPreview() {
    return (
        <Flex gap="m" wrap="wrap">
            {[
                { title: "Typografi", img: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=600&auto=format&fit=crop" },
                { title: "Farger", img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop" },
            ].map(({ title, img }) => (
                <Card
                    key={title}
                    as={Link}
                    href="#"
                    padding="s"
                    clickable
                    aria-label={title}
                    style={{ flex: 1, minWidth: "12rem" }}
                >
                    <CardImage src={img} alt="" placement="top" style={{ height: "10rem", objectFit: "cover" }} />
                    <div style={{ paddingBlockStart: "var(--jkl-spacing-m)" }}>
                        <h2>{title}</h2>
                    </div>
                </Card>
            ))}
        </Flex>
    );
}


export const examples: ComponentExample[] = [
    {
                title: "Grunnleggende innholdskort",
                description: "Typisk mønster: Card med Flex-kolonne internt. Header øverst, innhold i midten, handlinger nederst.",
                tags: ["variant:high"],
                uses: ["flex", "button"],
                code: `<Card padding="l">
      <Flex direction="column" gap="s">
        <h2>Tittel på kortet</h2>
        <p>Beskrivelse av innholdet i dette kortet.</p>
        <Flex gap="s">
          <Button>Åpne</Button>
          <Button variant="ghost">Mer info</Button>
        </Flex>
      </Flex>
    </Card>`,
                preview: <CardBasicPreview />,
            },
    {
                title: "Varianter: high, low og outlined",
                description: "high (standard) brukes på hvit bakgrunn, low på lys grå bakgrunn, outlined der du vil unngå skygge helt.",
                tags: ["variant"],
                code: `<Flex gap="m" wrap="wrap">
      <Card variant="high" padding="m" style={{ flex: 1, minWidth: "10rem" }}>
        <strong>high</strong>
        <p className="muted">Sterk skygge. Bruk på hvit bakgrunn.</p>
      </Card>
      <Card variant="low" padding="m" style={{ flex: 1, minWidth: "10rem" }}>
        <strong>low</strong>
        <p className="muted">Svak skygge. Bruk på lys grå bakgrunn.</p>
      </Card>
      <Card variant="outlined" padding="m" style={{ flex: 1, minWidth: "10rem" }}>
        <strong>outlined</strong>
        <p className="muted">Kantlinje, ingen skygge.</p>
      </Card>
    </Flex>`,
                preview: (
                    <Flex gap="m" wrap="wrap">
                        <Card variant="high" padding="m" style={{ flex: 1, minWidth: "10rem" }}>
                            <strong>high</strong>
                            <p className="muted">Sterk skygge. Bruk på hvit bakgrunn.</p>
                        </Card>
                        <Card variant="low" padding="m" style={{ flex: 1, minWidth: "10rem" }}>
                            <strong>low</strong>
                            <p className="muted">Svak skygge. Bruk på lys grå bakgrunn.</p>
                        </Card>
                        <Card variant="outlined" padding="m" style={{ flex: 1, minWidth: "10rem" }}>
                            <strong>outlined</strong>
                            <p className="muted">Kantlinje, ingen skygge.</p>
                        </Card>
                    </Flex>
                ),
            },
    {
                title: "Klikkbart kort",
                description: "Bruk as=\"a\" og clickable for å gjøre hele kortet klikkbart. Sett aria-label så skjermleseren ikke leser alt innholdet.",
                tags: ["clickable", "interaktiv"],
                uses: ["flex", "tag"],
                code: `<Flex gap="m" wrap="wrap">
      <Card as="a" href="/forsikringer/bilforsikring" clickable aria-label="Bilforsikring kasko">
        <Flex direction="column" gap="xs">
          <Flex justifyContent="space-between" alignItems="center">
            <strong>Bilforsikring</strong>
            <Tag variant="success">Aktiv</Tag>
          </Flex>
          <p className="muted">Kasko · Utløper 31.12.2026</p>
        </Flex>
      </Card>
      <Card as="a" href="/forsikringer/innbo" clickable aria-label="Innboforsikring">
        <Flex direction="column" gap="xs">
          <Flex justifyContent="space-between" alignItems="center">
            <strong>Innboforsikring</strong>
            <Tag variant="warning">Fornyes snart</Tag>
          </Flex>
          <p className="muted">Standard · Utløper 01.06.2026</p>
        </Flex>
      </Card>
    </Flex>`,
                preview: (
                    <Flex gap="m" wrap="wrap">
                        <Card as="a" href="#" clickable aria-label="Bilforsikring kasko" style={{ flex: 1, minWidth: "12rem" }}>
                            <Flex direction="column" gap="xs">
                                <Flex justifyContent="space-between" alignItems="center">
                                    <strong>Bilforsikring</strong>
                                    <Tag variant="success">Aktiv</Tag>
                                </Flex>
                                <p className="muted">Kasko · Utløper 31.12.2026</p>
                            </Flex>
                        </Card>
                        <Card as="a" href="#" clickable aria-label="Innboforsikring" style={{ flex: 1, minWidth: "12rem" }}>
                            <Flex direction="column" gap="xs">
                                <Flex justifyContent="space-between" alignItems="center">
                                    <strong>Innboforsikring</strong>
                                    <Tag variant="warning">Fornyes snart</Tag>
                                </Flex>
                                <p className="muted">Standard · Utløper 01.06.2026</p>
                            </Flex>
                        </Card>
                    </Flex>
                ),
            },
    {
                title: "Artikkelkort med bilde (BlogPostCard-mønster)",
                description: "Bruk CardImage placement=\"top\" for et bilde som bløder kant-i-kant øverst i kortet. Kombiner med Card as={Link} clickable for å gjøre hele kortet klikkbart. Se CardImage-dokumentasjonen for alle placement-verdier.",
                tags: ["bilde", "clickable", "navigasjon"],
                uses: ["card-image"],
                code: `<Card
      as={Link}
      href="/artikkel/typografi"
      padding="s"
      clickable
      aria-label="Artikkel om typografi"
    >
      <CardImage
        src="/images/typografi.jpg"
        alt=""
        placement="top"
        style={{ height: "12rem", objectFit: "cover" }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--jkl-spacing-s)", paddingBlockStart: "var(--jkl-spacing-m)" }}>
        <h2 style={{ margin: 0 }}>Typografi i Jøkul</h2>
        <p style={{ margin: 0, color: "var(--jkl-color-text-subdued)" }}>
          Hvordan Fremtind Grotesk bygger opp hierarki og lesbarhet.
        </p>
      </div>
    </Card>`,
                preview: <BlogPostCardPreview />,
            },
    {
                title: "Bildekortgrid (TokenCard-mønster)",
                description: "Flere klikkbare kort med bilde i et grid. CardImage sørger for riktig bleed uavhengig av padding på kortet — ingen manuell negativ margin nødvendig.",
                tags: ["bilde", "grid", "clickable"],
                uses: ["card-image", "flex"],
                code: `<Flex gap="m" wrap="wrap">
      {articles.map(({ id, title, image }) => (
        <Card
          key={id}
          as={Link}
          href={\`/artikler/\${id}\`}
          padding="s"
          clickable
          aria-label={title}
          style={{ flex: 1, minWidth: "12rem" }}
        >
          <CardImage src={image} alt="" placement="top" style={{ height: "10rem", objectFit: "cover" }} />
          <div style={{ paddingBlockStart: "var(--jkl-spacing-m)" }}>
            <h2 style={{ margin: 0 }}>{title}</h2>
          </div>
        </Card>
      ))}
    </Flex>`,
                preview: <TokenCardPreview />,
            },
    {
                title: "Detaljkort med oppsummering",
                tags: ["composition"],
                uses: ["flex", "tag", "description-list", "button"],
                code: `<Card padding="l" style={{ maxWidth: "28rem" }}>
      <Flex direction="column" gap="m">
        <Flex justifyContent="space-between" alignItems="center">
          <h2 style={{ margin: 0 }}>Bilforsikring kasko</h2>
          <Tag variant="success">Aktiv</Tag>
        </Flex>
        <DescriptionList>
          <DescriptionTerm>Registreringsnummer</DescriptionTerm>
          <DescriptionDetail>AB 12345</DescriptionDetail>
          <DescriptionTerm>Månedspremie</DescriptionTerm>
          <DescriptionDetail>542 kr</DescriptionDetail>
          <DescriptionTerm>Neste forfall</DescriptionTerm>
          <DescriptionDetail>15. april 2026</DescriptionDetail>
        </DescriptionList>
        <Flex gap="s">
          <Button>Endre dekning</Button>
          <Button variant="ghost">Meld skade</Button>
        </Flex>
      </Flex>
    </Card>`,
                preview: <CardDetailPreview />,
            }
];
