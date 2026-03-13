"use client";

import React from "react";
import {Link} from "@fremtind/jokul/link";
import {Flex} from "@fremtind/jokul/flex";
import {Card} from "@fremtind/jokul/card";
import {Tag} from "@fremtind/jokul/tag";
import {Grid} from "@/components/Grid";
import {blogPosts} from "@/lib/blogPosts";
import {componentDocs} from "@/lib/componentDocs";
import {foundationalPosts} from "@/lib/foundationalPosts";

export default function Home() {
    const recentPosts = blogPosts.slice(0, 3);

    return (
        <Flex as="main" direction="column" gap="xl">
            <header>
                <h1>Jøkul læringsressurser</h1>
                <p>
                    En samling artikler, veiledninger og komponentdokumentasjon for deg
                    som bygger med{" "}
                    <Link href="https://jokul.fremtind.no/" external>Jøkul</Link>
                    {" "}— designsystemet til Fremtind.
                </p>
                <Flex as="ul" className="chip-list" gap="s" wrap="wrap">
                    <li><Tag variant="info">React</Tag></li>
                    <li><Tag variant="info">TypeScript</Tag></li>
                    <li><Tag variant="info">WCAG</Tag></li>
                    <li><Tag variant="info">Designtokens</Tag></li>
                    <li><Tag variant="info">Next.js</Tag></li>
                </Flex>
            </header>

            <Grid columns={3} gap="l" style={{ alignItems: "start" }}>
                <Card padding="l">
                    <h2><Link href="/foundational">Grunnleggende konsepter</Link></h2>
                    <p>
                        Fundamentene i Jøkul — typografi, farger og spacing.
                        Essensielle artikler for å forstå designsystemets kjerneprinsipper
                        og bruke dem riktig i dine prosjekter.
                    </p>
                    <p className="muted">{foundationalPosts.length} artikler</p>
                    <h3>Konsepter</h3>
                    <ul className="chip-list" style={{ display: "flex", flexDirection: "column", gap: "var(--jkl-spacing-xs)" }}>
                        {foundationalPosts.map((post) => (
                            <li key={post.id}><Link href={`/foundational/${post.id}`}>{post.title}</Link></li>
                        ))}
                    </ul>
                    <Link href="/foundational">Se alle →</Link>
                </Card>

                <Card padding="l">
                    <h2><Link href="/blog">Blogg</Link></h2>
                    <p>
                        Dybdeartikler om tilgjengelighet, fargesystemer, typografi,
                        spacing, ikoner og mye mer. Skrevet for utviklere og designere
                        som vil bruke Jøkul riktig.
                    </p>
                    <p className="muted">{blogPosts.length} artikler</p>
                    <h3>Siste innlegg</h3>
                    <ul className="chip-list" style={{ display: "flex", flexDirection: "column", gap: "var(--jkl-spacing-xs)" }}>
                        {recentPosts.map((post) => (
                            <li key={post.id}>
                                <Flex justifyContent="space-between" alignItems="start" gap="s">
                                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                                    <Tag variant="neutral">{post.category}</Tag>
                                </Flex>
                            </li>
                        ))}
                    </ul>
                    <Link href="/blog">Se alle innlegg →</Link>
                </Card>

                <Card padding="l">
                    <h2><Link href="/component">Komponenter</Link></h2>
                    <p>
                        Prop-tabeller, levende kodeeksempler og bruksregler for
                        komponentene i Jøkul. Alt du trenger for å integrere
                        komponentene riktig i din applikasjon.
                    </p>
                    <p className="muted">{componentDocs.length} komponenter dokumentert</p>
                    <h3>Tilgjengelige komponenter</h3>
                    <Flex as="ul" className="chip-list" gap="xs" wrap="wrap">
                        {componentDocs.map((doc) => (
                            <li key={doc.id}>
                                <Link href={`/component/${doc.id}`}>{doc.name}</Link>
                            </li>
                        ))}
                    </Flex>
                    <Link href="/component">Se all komponentdokumentasjon →</Link>
                </Card>
            </Grid>

            <footer>
                <nav aria-label="Eksterne lenker">
                    <Flex as="ul" className="chip-list" gap="m">
                        <li><Link href="https://jokul.fremtind.no/" external>Jøkul dokumentasjon</Link></li>
                        <li><Link href="https://github.com/fremtind/jokul" external>GitHub</Link></li>
                    </Flex>
                </nav>
            </footer>
        </Flex>
    );
}
