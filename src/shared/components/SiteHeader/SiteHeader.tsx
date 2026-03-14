"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Link as JklLink } from "@fremtind/jokul/link";
import { Tag } from "@fremtind/jokul/tag";
import { Logo } from "@fremtind/jokul/logo";
import { Popover } from "@fremtind/jokul/popover";
import { foundationalPosts } from "@/features/foundational/data";
import { componentDocs } from "@/features/component-docs/data";
import { blogPosts } from "@/features/blog/data";
import "./site-header.scss";

const CATEGORIES = [
    "Skjema",
    "Handling",
    "Visning",
    "Navigasjon",
    "Overlegg",
    "Tilbakemelding",
    "Layout",
] as const;

/** Wraps a Popover with hover-open/close behaviour.
 *  Both trigger and content keep the popover alive while hovered,
 *  with a short close-delay to allow mouse movement between the two.
 */
function NavDropdown({
    label,
    placement = "bottom-start",
    wide = false,
    children,
}: {
    label: string;
    placement?: "bottom-start" | "bottom-end";
    wide?: boolean;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const keepOpen = () => {
        clearTimeout(closeTimer.current);
        setOpen(true);
    };

    const scheduleClose = () => {
        closeTimer.current = setTimeout(() => setOpen(false), 150);
    };

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            placement={placement}
            modal={false}
            offset={4}
        >
            <Popover.Trigger asChild>
                <button
                    type="button"
                    className="site-header__trigger"
                    onMouseEnter={keepOpen}
                    onMouseLeave={scheduleClose}
                    onFocus={keepOpen}
                    onBlur={scheduleClose}
                >
                    {label}
                </button>
            </Popover.Trigger>
            <Popover.Content
                padding={0}
                returnFocus={false}
                className={`site-header__dropdown${wide ? " site-header__dropdown--wide" : ""}`}
                onMouseEnter={keepOpen}
                onMouseLeave={scheduleClose}
            >
                {children}
            </Popover.Content>
        </Popover>
    );
}

export function SiteHeader() {
    const headerRef = useRef<HTMLElement>(null);
    const [stuck, setStuck] = useState(false);

    // Observe whether the header is stuck to the top.
    // top: -1px means 1px is clipped when stuck → intersectionRatio < 1.
    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setStuck(entry.intersectionRatio < 1),
            { threshold: [1] },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const recentBlogPosts = [...blogPosts].slice(0, 5);

    const componentsByCategory = CATEGORIES.map((cat) => ({
        cat,
        docs: componentDocs.filter((d) => d.category === cat),
    }));

    return (
        <header
            ref={headerRef}
            className={`site-header${stuck ? " site-header--stuck" : ""}`}
            role="banner"
        >
            <div className="site-header__inner">
                <Link href="/jokul" className="site-header__logo" aria-label="Jøkul — til forsiden">
                    <Logo isSymbol className="site-header__logo-mark" title="Jøkul" />
                </Link>

                <nav aria-label="Primærnavigasjon">
                    <ul className="site-header__nav" role="list">

                        {/* ── Grunnleggende ─────────────────────────── */}
                        <li className="site-header__item">
                            <NavDropdown
                                label="Grunnleggende"
                            >
                                <div className="site-header__dropdown-header">
                                    <JklLink href="/jokul/foundational">
                                        Se alle prinsipper →
                                    </JklLink>
                                </div>
                                <ul className="site-header__dropdown-list" role="list">
                                    {foundationalPosts.map((post) => (
                                        <li key={post.id}>
                                            <Link
                                                href={`/jokul/foundational/${post.id}`}
                                                className="site-header__dropdown-item"
                                            >
                                                <span className="site-header__dropdown-name">{post.title}</span>
                                                <span className="site-header__dropdown-desc">{post.excerpt}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </NavDropdown>
                        </li>

                        {/* ── Komponenter ───────────────────────────── */}
                        <li className="site-header__item">
                            <NavDropdown
                                label="Komponenter"
                                wide
                            >
                                <div className="site-header__dropdown-header">
                                    <JklLink href="/jokul/component">
                                        Se alle {componentDocs.length} komponenter →
                                    </JklLink>
                                </div>
                                <div className="site-header__dropdown-grid">
                                    {componentsByCategory.map(({ cat, docs }) => (
                                        <div key={cat} className="site-header__dropdown-col">
                                            <span className="site-header__dropdown-cat">{cat}</span>
                                            <ul role="list">
                                                {docs.map((doc) => (
                                                    <li key={doc.id}>
                                                        <Link
                                                            href={`/jokul/component/${doc.id}`}
                                                            className="site-header__dropdown-item site-header__dropdown-item--compact"
                                                        >
                                                            <span>{doc.name}</span>
                                                            {doc.status === "beta" && (
                                                                <Tag>Beta</Tag>
                                                            )}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </NavDropdown>
                        </li>

                        {/* ── Blogg ─────────────────────────────────── */}
                        <li className="site-header__item">
                            <NavDropdown
                                label="Blogg"
                                placement="bottom-end"
                            >
                                <div className="site-header__dropdown-header">
                                    <JklLink href="/jokul/blog">
                                        Se alle innlegg →
                                    </JklLink>
                                </div>
                                <ul className="site-header__dropdown-list" role="list">
                                    {recentBlogPosts.map((post) => (
                                        <li key={post.id}>
                                            <Link
                                                href={`/jokul/blog/${post.id}`}
                                                className="site-header__dropdown-item"
                                            >
                                                <span className="site-header__dropdown-name">{post.title}</span>
                                                <span className="site-header__dropdown-meta">{post.excerpt}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </NavDropdown>
                        </li>

                    </ul>
                </nav>
            </div>
        </header>
    );
}

