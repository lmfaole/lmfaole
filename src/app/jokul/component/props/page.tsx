"use client";

import React, {useMemo, useState} from "react";
import {Flex} from "@fremtind/jokul/flex";
import {Card} from "@fremtind/jokul/card";
import {Search} from "@fremtind/jokul/search";
import {NavTab, NavTabs} from "@fremtind/jokul/tabs";
import {SkeletonAnimation, SkeletonElement} from "@fremtind/jokul/loader";
import {Toolbar} from "@/shared/components/Toolbar";
import {
    Table, TableHead, TableHeader, TableBody, TableRow, TableCell, TableCaption,
    useSortableTableHeader,
} from "@fremtind/jokul/table";
import {Tag} from "@fremtind/jokul/tag";
import {Link} from "@fremtind/jokul/link";
import type {PropSource, PropStatus} from "@/app/jokul/_component-docs/data";
import {ALL_PROP_ENTRIES} from "@/app/jokul/_component-docs/prop-index";
import {PageHeader} from "@/shared/components/PageHeader";
import {useLocalStorage} from "@/shared/hooks/useLocalStorage";
import "../component-index.scss";

const SOURCE_LABEL: Record<PropSource, string> = {
    custom: "Egendefinert",
    native: "Native HTML",
    aria: "ARIA",
    react: "React",
};

const STATUS_LABEL: Record<PropStatus, string> = {
    stable: "—",
    deprecated: "deprecated",
    experimental: "beta",
};

export default function PropIndexPage() {
    const [propQuery, setPropQuery] = useState("");
    const [sortKey, setSortKey] = useState("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | "none">("asc");
    const [, , ready] = useLocalStorage("comp-prop-sort-v2", "name");

    const {getSortProps} = useSortableTableHeader(sortKey, sortDirection, (key, dir) => {
        setSortKey(key);
        setSortDirection(dir);
    });

    const filteredProps = useMemo(() => {
        const q = propQuery.toLowerCase().trim();
        const results = ALL_PROP_ENTRIES.filter(
            (e) => !q || e.propName.toLowerCase().includes(q) || e.usedBy.some((c) => c.name.toLowerCase().includes(q))
        );
        return results.sort((a, b) => {
            const dir = sortDirection === "desc" ? -1 : 1;
            if (sortKey === "source") return dir * a.source.localeCompare(b.source, "nb");
            if (sortKey === "status") return dir * a.status.localeCompare(b.status, "nb");
            if (sortKey === "usedBy") return dir * (a.usedBy.length - b.usedBy.length);
            return dir * a.propName.localeCompare(b.propName, "nb");
        });
    }, [propQuery, sortKey, sortDirection]);

    if (!ready) {
        return (
            <Flex as="main" direction="column" gap="xl">
                <PageHeader
                    title="Komponentdokumentasjon"
                    description="Detaljert API-dokumentasjon, prop-tabeller og levende eksempler for komponenter fra Jøkul. Bruk dette som referanse når du bygger med designsystemet."
                />
                <SkeletonAnimation textDescription="Laster innstillinger…">
                    <SkeletonElement width="20rem" height="2.5rem" />
                    <SkeletonElement width="100%" height="12rem" className="component-index__skeleton-gap" />
                </SkeletonAnimation>
            </Flex>
        );
    }

    return (
        <Flex as="main" direction="column" gap="xl">
            <PageHeader
                title="Komponentdokumentasjon"
                description="Detaljert API-dokumentasjon, prop-tabeller og levende eksempler for komponenter fra Jøkul. Bruk dette som referanse når du bygger med designsystemet."
            />

            <div>
            <NavTabs aria-label="Vis">
                <NavTab href="/jokul/component">Komponenter</NavTab>
                <NavTab href="/jokul/component/props" aria-selected>Props-oversikt</NavTab>
            </NavTabs>
            <Card padding="l">
                <Toolbar>
                <Search
                    label="Filtrer props"
                    labelProps={{ srOnly: false }}
                    value={propQuery}
                    onChange={(e) => setPropQuery(e.target.value)}
                    placeholder="Propnavn eller komponentnavn…"
                />
                </Toolbar>
                <Table caption={<TableCaption srOnly>Props-oversikt</TableCaption>} collapseToList fullWidth>
                    <TableHead>
                        <TableRow>
                            <TableHeader sortable={getSortProps("name").sortable}>Prop</TableHeader>
                            <TableHeader sortable={getSortProps("source").sortable}>Kilde</TableHeader>
                            <TableHeader sortable={getSortProps("status").sortable}>Status</TableHeader>
                            <TableHeader sortable={getSortProps("usedBy").sortable}>Brukt i</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProps.map((entry) => (
                            <TableRow key={entry.propName}>
                                <TableCell data-th="Prop"><code>{entry.propName}</code></TableCell>
                                <TableCell data-th="Kilde">{SOURCE_LABEL[entry.source]}</TableCell>
                                <TableCell data-th="Status">
                                    {entry.status !== "stable" ? (
                                        <Tag variant={entry.status === "deprecated" ? "warning" : "info"}>
                                            {STATUS_LABEL[entry.status]}
                                        </Tag>
                                    ) : (
                                        <span style={{color: "var(--jkl-color-text-subdued)"}}>—</span>
                                    )}
                                </TableCell>
                                <TableCell data-th="Brukt i">
                                    <Flex gap="2xs" wrap="wrap">
                                        {entry.usedBy.map((comp, i) => (
                                            <React.Fragment key={comp.id}>
                                                <Link href={`/jokul/component/${comp.id}`}>{comp.name}</Link>
                                                {i < entry.usedBy.length - 1 && <span style={{color: "var(--jkl-color-text-subdued)"}}>,</span>}
                                            </React.Fragment>
                                        ))}
                                    </Flex>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
            </div>
        </Flex>
    );
}
