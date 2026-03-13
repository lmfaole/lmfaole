"use client";
import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom";
import {
    useModal,
    ModalContainer,
    ModalOverlay,
    Modal,
    ModalHeader,
    ModalTitle,
    ModalCloseButton,
    ModalBody,
} from "@fremtind/jokul/modal";
import { Button } from "@fremtind/jokul/button";
import { Search } from "@fremtind/jokul/search";
import { Link } from "@fremtind/jokul/link";
import { componentDocs } from "@/lib/componentDocs";

type PropEntry = {
    propName: string;
    usedBy: { id: string; name: string }[];
};

const ALL_PROP_ENTRIES: PropEntry[] = (() => {
    const map = new Map<string, { id: string; name: string }[]>();
    for (const doc of componentDocs) {
        for (const prop of doc.props) {
            const existing = map.get(prop.name) ?? [];
            if (!existing.find((e) => e.id === doc.id)) {
                existing.push({ id: doc.id, name: doc.name });
            }
            map.set(prop.name, existing);
        }
    }
    return Array.from(map.entries())
        .map(([propName, usedBy]) => ({ propName, usedBy }))
        .sort((a, b) => a.propName.localeCompare(b.propName, "nb"));
})();

const HEADING = "Prop-indeks";

export function PropIndex() {
    const [instance, { title, overlay, container, modal, closeButton }] = useModal({ title: HEADING });
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return ALL_PROP_ENTRIES;
        return ALL_PROP_ENTRIES.filter(
            (e) =>
                e.propName.toLowerCase().includes(q) ||
                e.usedBy.some((c) => c.name.toLowerCase().includes(q)),
        );
    }, [query]);

    return (
        <>
            <Button variant="secondary" onClick={() => instance?.show()}>
                Vis prop-indeks
            </Button>

            {typeof window !== "undefined" &&
                ReactDOM.createPortal(
                    <ModalContainer {...container}>
                        <ModalOverlay {...overlay} />
                        <Modal {...modal} style={{ maxWidth: "min(90vw, 640px)", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
                            <ModalHeader>
                                <ModalTitle {...title}>{HEADING}</ModalTitle>
                                <ModalCloseButton {...closeButton} />
                            </ModalHeader>
                            <ModalBody style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "var(--jkl-spacing-m)" }}>
                                <Search
                                    label="Filtrer props"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Propnavn eller komponent…"
                                />
                                <p className="muted" style={{ margin: 0, fontSize: "var(--jkl-font-size-s)" }}>
                                    {filtered.length} av {ALL_PROP_ENTRIES.length} props
                                </p>
                                <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "var(--jkl-spacing-s)" }}>
                                    {filtered.map((entry) => (
                                        <div key={entry.propName} style={{ display: "grid", gridTemplateColumns: "12rem 1fr", gap: "var(--jkl-spacing-xs)", alignItems: "baseline", borderBottom: "1px solid var(--jkl-color-border-subtle)", paddingBottom: "var(--jkl-spacing-s)" }}>
                                            <dt>
                                                <code style={{ fontWeight: 600 }}>{entry.propName}</code>
                                            </dt>
                                            <dd style={{ margin: 0, display: "flex", flexWrap: "wrap", gap: "var(--jkl-spacing-2xs)" }}>
                                                {entry.usedBy.map((comp) => (
                                                    <Link key={comp.id} href={`/component/${comp.id}`} onClick={() => instance?.hide()}>
                                                        {comp.name}
                                                    </Link>
                                                ))}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </ModalBody>
                        </Modal>
                    </ModalContainer>,
                    document.body,
                )}
        </>
    );
}
