import Link from "next/link";
import { Card, CardImage } from "@fremtind/jokul/card";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentExample } from "../types";


const IMAGE_URL = "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&auto=format&fit=crop";

const IMAGE_URL_2 = "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop";

function CardImageTopPreview() {
    return (
        <Card padding="s" style={{ maxWidth: "20rem", width: "100%" }}>
            <CardImage src={IMAGE_URL} alt="Typografi" placement="top" style={{ height: "12rem", objectFit: "cover" }} />
            <div style={{ paddingBlockStart: "var(--jkl-spacing-m)" }}>
                <h2 style={{ margin: 0 }}>Typografi</h2>
                <p style={{ margin: 0, color: "var(--jkl-color-text-subdued)" }}>Fremtind Grotesk og dens bruksområder.</p>
            </div>
        </Card>
    );
}

function CardImageMiddlePreview() {
    return (
        <Card padding="m" style={{ maxWidth: "20rem", width: "100%" }}>
            <h2 style={{ margin: "0 0 var(--jkl-spacing-s)" }}>Farger</h2>
            <CardImage src={IMAGE_URL_2} alt="Fargepalett" placement="middle" style={{ height: "10rem", objectFit: "cover" }} />
            <p style={{ margin: "var(--jkl-spacing-s) 0 0", color: "var(--jkl-color-text-subdued)" }}>Fargeskalaen som binder Jøkul-universet sammen.</p>
        </Card>
    );
}

function CardImageClickablePreview() {
    return (
        <Flex gap="m" wrap="wrap">
            {[
                { title: "Typografi", img: IMAGE_URL },
                { title: "Farger", img: IMAGE_URL_2 },
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
                    <CardImage src={img} alt="" placement="top" style={{ height: "9rem", objectFit: "cover" }} />
                    <div style={{ paddingBlockStart: "var(--jkl-spacing-m)" }}>
                        <h2 style={{ margin: 0 }}>{title}</h2>
                    </div>
                </Card>
            ))}
        </Flex>
    );
}

function CardImageFullPreview() {
    return (
        <Card padding="s" as={Link} href="#" clickable aria-label="Farger" style={{ maxWidth: "20rem", width: "100%" }}>
            <CardImage src={IMAGE_URL_2} alt="Fargepalett" placement="full" style={{ height: "14rem", objectFit: "cover" }} />
        </Card>
    );
}


export const examples: ComponentExample[] = [
    {
                title: "Bilde øverst i kortet (placement=\"top\")",
                description: "Standard bruk: bildet er det første elementet i kortet. CardImage legger til negativ margin øverst og på sidene slik at bildet bløder helt til kantene.",
                tags: ["placement:top"],
                uses: ["card"],
                code: `<Card padding="s">
      <CardImage
        src="/images/typografi.jpg"
        alt="Typografi"
        placement="top"
        style={{ height: "12rem", objectFit: "cover" }}
      />
      <div style={{ paddingBlockStart: "var(--jkl-spacing-m)" }}>
        <h2 style={{ margin: 0 }}>Typografi</h2>
        <p style={{ margin: 0, color: "var(--jkl-color-text-subdued)" }}>
          Fremtind Grotesk og dens bruksområder.
        </p>
      </div>
    </Card>`,
                preview: <CardImageTopPreview />,
            },
    {
                title: "Bilde i midten av kortet (placement=\"middle\")",
                description: "Bildet har innhold både over og under seg. Kun sidene får negativ margin — topp og bunn beholder kortets normale padding.",
                tags: ["placement:middle"],
                uses: ["card"],
                code: `<Card padding="m">
      <h2 style={{ margin: "0 0 var(--jkl-spacing-s)" }}>Farger</h2>
      <CardImage
        src="/images/farger.jpg"
        alt="Fargepalett"
        placement="middle"
        style={{ height: "10rem", objectFit: "cover" }}
      />
      <p style={{ margin: "var(--jkl-spacing-s) 0 0", color: "var(--jkl-color-text-subdued)" }}>
        Fargeskalaen som binder Jøkul-universet sammen.
      </p>
    </Card>`,
                preview: <CardImageMiddlePreview />,
            },
    {
                title: "Klikkbare bildekort (BlogPostCard / FoundationalCard-mønster)",
                description: "Kombiner Card as={Link} clickable med CardImage for fullt klikkbare bildekort. Sett aria-label på Card — ikke nøst en ekstra Link inne i kortet.",
                tags: ["clickable", "grid", "navigasjon"],
                uses: ["card"],
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
          <CardImage
            src={image}
            alt=""
            placement="top"
            style={{ height: "9rem", objectFit: "cover" }}
          />
          <div style={{ paddingBlockStart: "var(--jkl-spacing-m)" }}>
            <h2 style={{ margin: 0 }}>{title}</h2>
          </div>
        </Card>
      ))}
    </Flex>`,
                preview: <CardImageClickablePreview />,
            },
    {
                title: "Bilde fyller hele kortet (placement=\"full\")",
                description: "Bildet er det eneste innholdet. Negativ margin på alle fire sider. Nyttig for rene bildekort med overlay-tekst via CSS position.",
                tags: ["placement:full"],
                uses: ["card"],
                code: `<Card padding="s" as={Link} href="/artikler/farger" clickable aria-label="Farger">
      <CardImage
        src="/images/farger.jpg"
        alt="Fargepalett"
        placement="full"
        style={{ height: "14rem", objectFit: "cover" }}
      />
    </Card>`,
                preview: <CardImageFullPreview />,
            }
];
