"use client";

import React from "react";
import {Link} from "@fremtind/jokul/link";
import {Flex} from "@fremtind/jokul/flex";
import {Card} from "@fremtind/jokul/card";
import {Tag} from "@fremtind/jokul/tag";
import {blogPosts} from "@/lib/blogPosts";
import {componentDocs} from "@/lib/componentDocs";

export default function Home() {
    const recentPosts = blogPosts.slice(0, 3);

    return (
        <Flex as="main" direction="column" gap="xl">
            <Flex as="header" direction="column" gap="m">
                <Flex direction="column" gap="s">
                    <h1>Jøkul læringsressurser</h1>
                    <p>
                        En samling artikler, veiledninger og komponentdokumentasjon for deg
                        som bygger med{" "}
                        <Link href="https://jokul.fremtind.no/" external>Jøkul</Link>
                        {" "}— designsystemet til Fremtind.
                    </p>
                </Flex>
                <Flex gap="s" wrap="wrap">
                    <Tag variant="info">React</Tag>
                    <Tag variant="info">TypeScript</Tag>
                    <Tag variant="info">WCAG</Tag>
                    <Tag variant="info">Designtokens</Tag>
                    <Tag variant="info">Next.js</Tag>
                </Flex>
            </Flex>

            <Flex direction="column" className="frontpage-sections">
                <Card padding="l">
                    <Flex direction="column" gap="m">
                        <Flex direction="column" gap="xs">
                            <h2><Link href="/blog">Blogg</Link></h2>
                            <p>
                                Dybdeartikler om tilgjengelighet, fargesystemer, typografi,
                                spacing, ikoner og mye mer. Skrevet for utviklere og designere
                                som vil bruke Jøkul riktig.
                            </p>
                            <p className="muted">{blogPosts.length} artikler</p>
                        </Flex>
                        <Flex direction="column" gap="xs">
                            <h3>Siste innlegg</h3>
                            {recentPosts.map((post) => (
                                <Flex key={post.id} justifyContent="space-between" alignItems="start" gap="s">
                                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                                    <Tag variant="neutral">{post.category}</Tag>
                                </Flex>
                            ))}
                        </Flex>
                        <Link href="/blog">Se alle innlegg →</Link>
                    </Flex>
                </Card>

                <Card padding="l">
                    <Flex direction="column" gap="m">
                        <Flex direction="column" gap="xs">
                            <h2><Link href="/component">Komponentdokumentasjon</Link></h2>
                            <p>
                                Prop-tabeller, levende kodeeksempler og bruksregler for
                                komponentene i Jøkul. Alt du trenger for å integrere
                                komponentene riktig i din applikasjon.
                            </p>
                            <p className="muted">{componentDocs.length} komponenter dokumentert</p>
                        </Flex>
                        <Flex direction="column" gap="xs">
                            <h3>Tilgjengelige komponenter</h3>
                            <Flex gap="xs" wrap="wrap">
                                {componentDocs.map((doc) => (
                                    <Link key={doc.id} href={`/component/${doc.id}`}>
                                        {doc.name}
                                    </Link>
                                ))}
                            </Flex>
                        </Flex>
                        <Link href="/component">Se all komponentdokumentasjon →</Link>
                    </Flex>
                </Card>
            </Flex>

            <Flex as="footer" gap="m">
                <Link href="https://jokul.fremtind.no/" external>Jøkul dokumentasjon</Link>
                <Link href="https://github.com/fremtind/jokul" external>GitHub</Link>
            </Flex>
        </Flex>
    );
}
