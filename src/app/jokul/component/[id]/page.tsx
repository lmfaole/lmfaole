"use client";

import {useState, useRef, useEffect} from "react";
import {Flex} from "@fremtind/jokul/flex";
import "./component-page.scss";
import {TableOfContents} from "@fremtind/jokul/table-of-contents";
import {Tab, TabList, TabPanel, Tabs, NavTab, NavTabs} from "@fremtind/jokul/tabs";
import {Card} from "@fremtind/jokul/card";
import {useParams} from "next/navigation";
import {getComponentDoc, getRelationships} from "@/features/component-docs/data";
import {PropTable} from "@/features/component-docs/components/PropTable";
import {MigrationExample} from "@/features/component-docs/components/MigrationExample";
import type {Migration} from "@/features/component-docs/data";
import {NotFound} from "@/shared/components/NotFound";
import {AlternativesList} from "@/features/component-docs/components/AlternativesList";
import {SubcomponentsList} from "@/features/component-docs/components/SubcomponentsList";
import {RelatedComponentsTable} from "@/features/component-docs/components/RelatedComponentsTable";
import {PageHero} from "@/shared/components/PageHero/PageHero";
import {DotsIllustration} from "@/shared/components/Illustration";

function MigrationSection({ migrations }: { migrations: Migration[] }) {
    const [active, setActive] = useState<string>(migrations[0]?.deprecates.name ?? "");
    const pendingScroll = useRef<string | null>(null);

    useEffect(() => {
        if (pendingScroll.current) {
            const el = document.getElementById(`migration-${pendingScroll.current}`);
            if (el) {
                const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--jkl-spacing-xl")) || 64;
                const top = el.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: "smooth" });
                pendingScroll.current = null;
            }
        }
    }, [active]);

    useEffect(() => {
        function handleHashChange() {
            const match = window.location.hash.match(/^#migration-(.+)$/);
            if (!match) return;
            const name = decodeURIComponent(match[1]);
            if (migrations.some((m) => m.deprecates.name === name)) {
                pendingScroll.current = name;
                setActive(name);
            }
        }
        handleHashChange();
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [migrations]);

    const visible = migrations.filter((m) => m.deprecates.name === active);

    function selectTab(name: string) {
        pendingScroll.current = name;
        setActive(name);
    }

    return (
        <Flex as="section" direction="column" gap="m">
            <h2 id="migrering">Migrering</h2>
            <div>
                <NavTabs aria-label="Filtrer migrering">
                    {migrations.map((m) => (
                        <NavTab
                            key={m.deprecates.name}
                            as="button"
                            aria-selected={active === m.deprecates.name}
                            onClick={() => selectTab(m.deprecates.name)}
                        >
                            {m.deprecates.name}
                        </NavTab>
                    ))}
                </NavTabs>
                {visible.map((migration) => (
                    <Card
                        key={migration.title}
                        padding="l"
                       
                        id={`migration-${migration.deprecates.name}`}
                    >
                        <MigrationExample migration={migration} />
                    </Card>
                ))}
            </div>
        </Flex>
    );
}

export default function ComponentPage() {
    const {id} = useParams<{ id: string }>();
    const doc = getComponentDoc(id);
    const {alternatives, subcomponents, related} = getRelationships(id);

    if (!doc) {
        return (
            <NotFound
                message="Fant ikke komponenten"
                backHref="/component"
                backLabel="Tilbake til alle komponenter"
            />
        );
    }

    return (
        <Flex as="article" direction="column" gap="xl">
            <PageHero
                title={doc.name}
                background={<DotsIllustration />}
            />

            <TableOfContents label="Innhold">
                {doc.warnings && (
                    <TableOfContents.Link href="#viktig-informasjon">Viktig informasjon</TableOfContents.Link>
                )}
                <TableOfContents.Link href="#props">Props</TableOfContents.Link>
                {alternatives.length > 0 && (
                    <TableOfContents.Link href="#alternativer">Alternativer</TableOfContents.Link>
                )}
                {subcomponents.length > 0 && (
                    <TableOfContents.Link href="#delkomponenter">Delkomponenter</TableOfContents.Link>
                )}
                {related.length > 0 && (
                    <TableOfContents.Link href="#relaterte-komponenter">Relaterte komponenter</TableOfContents.Link>
                )}
                {doc.migrations && doc.migrations.length > 0 && (
                    <TableOfContents.Link href="#migrering">Migrering</TableOfContents.Link>
                )}
            </TableOfContents>

            {doc.warnings && (
                <Flex as="section" direction="column" gap="m">
                    <h2 id="viktig-informasjon">Viktig informasjon</h2>
                    {Array.isArray(doc.warnings) ? (
                        <ul>
                            {doc.warnings.map((note, i) => <li key={i}>{note}</li>)}
                        </ul>
                    ) : (
                        <p>{doc.warnings}</p>
                    )}
                </Flex>
            )}

            <Flex as="section" direction="column" gap="m">
                <h2 id="props">Props</h2>
                {doc.subComponents && doc.subComponents.length > 0 ? (
                    <Tabs>
                        <TabList>
                            <Tab>{doc.name} <span style={{
                                color: "var(--jkl-color-text-subdued)",
                                fontVariantNumeric: "tabular-nums"
                            }}>({doc.props.length})</span></Tab>
                            {doc.subComponents.map((sub) => (
                                <Tab key={sub.name}>{sub.name} <span style={{
                                    color: "var(--jkl-color-text-subdued)",
                                    fontVariantNumeric: "tabular-nums"
                                }}>({sub.props.length})</span></Tab>
                            ))}
                        </TabList>
                        <TabPanel>
                            <Card padding="l">
                                <PropTable props={doc.props} migrations={doc.migrations}/>
                            </Card>
                        </TabPanel>
                        {doc.subComponents.map((sub) => (
                            <TabPanel key={sub.name}>
                                <Card padding="l">
                                    {sub.description &&
                                        <p style={{marginBottom: "var(--jkl-spacing-m)"}}>{sub.description}</p>}
                                    <PropTable props={sub.props} migrations={doc.migrations}/>
                                </Card>
                            </TabPanel>
                        ))}
                    </Tabs>
                ) : (
                    <PropTable props={doc.props} migrations={doc.migrations}/>
                )}
            </Flex>

            {alternatives.length > 0 && (
                <Flex as="section" direction="column" gap="m">
                    <h2 id="alternativer">Alternativer</h2>
                    <AlternativesList items={alternatives}/>
                </Flex>
            )}

            {subcomponents.length > 0 && (
                <Flex as="section" direction="column" gap="m">
                    <h2 id="delkomponenter">Delkomponenter</h2>
                    <SubcomponentsList items={subcomponents}/>
                </Flex>
            )}

            {doc.migrations && doc.migrations.length > 0 && (
                <MigrationSection migrations={doc.migrations} />
            )}

            {related.length > 0 && (
                <Flex as="section" direction="column" gap="m">
                    <h2 id="relaterte-komponenter">Relaterte komponenter</h2>
                    <RelatedComponentsTable items={related}/>
                </Flex>
            )}

        </Flex>
    );
}
