"use client";

import {Flex} from "@fremtind/jokul/flex";
import "./component-page.scss";
import {TableOfContents} from "@fremtind/jokul/table-of-contents";
import {Tab, TabList, TabPanel, Tabs} from "@fremtind/jokul/tabs";
import {Card} from "@fremtind/jokul/card";
import {useParams} from "next/navigation";
import {getComponentDoc} from "@/lib/componentDocs";
import {PropTable} from "@/components/PropTable";
import {ComponentExample} from "@/components/ComponentExample";
import {MigrationExample} from "@/components/MigrationExample";
import {NotFound} from "@/components/NotFound";
import {NavLink} from "@fremtind/jokul/nav-link";
import {PreviewContainer} from "@/components/PreviewContainer";
import {CopyableCode} from "@/components/CopyableCode/CopyableCode";

export default function ComponentPage() {
    const {id} = useParams<{ id: string }>();
    const doc = getComponentDoc(id);

    if (!doc) {
        return (
            <NotFound
                message="Fant ikke komponenten"
                backHref="/component"
                backLabel="Tilbake til alle komponenter"
            />
        );
    }

    const regularExamples = doc.examples.filter((ex) => !ex.migrationBefore);
    const migrationExamples = doc.examples.filter((ex) => !!ex.migrationBefore);

    return (
        <Flex as="article" direction="column" gap="xl">
            <PreviewContainer as="header" className="component-header">
                <NavLink className="component-header__back" href="/jokul/component" back>Tilbake til alle
                    komponenter</NavLink>
                <Flex direction="column" gap="s" wrap="wrap">
                    <h1>{doc.name}</h1>
                    <div>
                        <CopyableCode>{doc.package}</CopyableCode>
                    </div>
                    <p>{doc.description}</p>
                </Flex>
                {(doc.preview ?? regularExamples[0]?.preview) && (
                    <div className="component-header__preview">
                        {doc.preview ?? regularExamples[0].preview}
                    </div>
                )}
            </PreviewContainer>

            <TableOfContents label="Innhold">
                {doc.warnings && (
                    <TableOfContents.Link href="#viktig-informasjon">Viktig informasjon</TableOfContents.Link>
                )}
                <TableOfContents.Link href="#props">Props</TableOfContents.Link>
                {regularExamples.length > 0 && (
                    <TableOfContents.Link href="#eksempler">Eksempler</TableOfContents.Link>
                )}
                {migrationExamples.length > 0 && (
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
                                <PropTable props={doc.props}/>
                            </Card>
                        </TabPanel>
                        {doc.subComponents.map((sub) => (
                            <TabPanel key={sub.name}>
                                <Card padding="l">
                                    {sub.description &&
                                        <p style={{marginBottom: "var(--jkl-spacing-m)"}}>{sub.description}</p>}
                                    <PropTable props={sub.props}/>
                                </Card>
                            </TabPanel>
                        ))}
                    </Tabs>
                ) : (
                    <PropTable props={doc.props}/>
                )}
            </Flex>

            <Flex as="section" direction="column" gap="m">
                <h2 id="eksempler">Eksempler</h2>
                {regularExamples.map((example) => (
                    <ComponentExample key={example.title} example={example}/>
                ))}
            </Flex>

            {migrationExamples.length > 0 && (
                <Flex as="section" direction="column" gap="m">
                    <h2 id="migrering">Migrering</h2>
                    <p>Disse eksemplene viser hvordan du erstatter utfasede props med den anbefalte API-en.</p>
                    {migrationExamples.map((example) => (
                        <MigrationExample
                            key={example.title}
                            example={example as typeof example & { migrationBefore: string }}
                        />
                    ))}
                </Flex>
            )}

        </Flex>
    );
}
