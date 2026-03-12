"use client";

import React, { useState, useMemo } from "react";
import { Flex } from "@fremtind/jokul/flex";
import { NavLink } from "@fremtind/jokul/nav-link";
import { Search } from "@fremtind/jokul/search";
import { Chip } from "@fremtind/jokul/chip";
import { blogPosts } from "@/lib/blogPosts";
import { BlogPostCard } from "@/components/BlogPostCard";
import { Grid } from "@/components/Grid";

const ALL_TAGS = Array.from(new Set(blogPosts.flatMap((p) => p.tags))).sort();
const ALL_CATEGORIES = Array.from(new Set(blogPosts.map((p) => p.category))).sort();

export default function BlogPage() {
    const [query, setQuery] = useState("");
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return blogPosts.filter((post) => {
            const matchesQuery =
                !q ||
                post.title.toLowerCase().includes(q) ||
                post.excerpt.toLowerCase().includes(q) ||
                post.tags.some((t) => t.toLowerCase().includes(q));
            const matchesTag = !activeTag || post.tags.includes(activeTag);
            const matchesCategory = !activeCategory || post.category === activeCategory;
            return matchesQuery && matchesTag && matchesCategory;
        });
    }, [query, activeTag, activeCategory]);

    const grouped = useMemo(() => {
        const map = new Map<string, typeof filtered>();
        for (const post of filtered) {
            if (!map.has(post.category)) map.set(post.category, []);
            map.get(post.category)!.push(post);
        }
        return Array.from(map.entries());
    }, [filtered]);

    return (
        <Flex as="main" direction="column" gap="xl">
            <NavLink href="/" back>Tilbake til forsiden</NavLink>
            <Flex direction="column" gap="s">
                <h1>Blogg</h1>
                <p>Artikler om Jøkul — designsystemet til Fremtind. Tips, dybdeanalyser og god praksis for deg som bygger med komponentbiblioteket.</p>
            </Flex>

            <Flex direction="column" gap="m">
                <Search
                    label="Søk i artikler"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tittel, beskrivelse eller tag…"
                />
                <Flex direction="column" gap="xs">
                    <p className="muted">Kategori</p>
                    <Flex gap="xs" wrap="wrap">
                        {ALL_CATEGORIES.map((cat) => (
                            <Chip
                                key={cat}
                                variant="filter"
                                selected={activeCategory === cat}
                                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                            >
                                {cat}
                            </Chip>
                        ))}
                    </Flex>
                </Flex>
                <Flex direction="column" gap="xs">
                    <p className="muted">Tags</p>
                    <Flex gap="xs" wrap="wrap">
                        {ALL_TAGS.map((tag) => (
                            <Chip
                                key={tag}
                                variant="filter"
                                selected={activeTag === tag}
                                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                            >
                                {tag}
                            </Chip>
                        ))}
                    </Flex>
                </Flex>
            </Flex>

            {filtered.length === 0 ? (
                <p className="muted">Ingen artikler samsvarer med filteret.</p>
            ) : (
                <Flex direction="column" gap="xl">
                    {grouped.map(([cat, posts]) => (
                        <Flex key={cat} direction="column" gap="l">
                            <h2>{cat}</h2>
                            <Grid gap="l">
                                {posts.map((post) => (
                                    <BlogPostCard key={post.id} post={post} />
                                ))}
                            </Grid>
                        </Flex>
                    ))}
                </Flex>
            )}
        </Flex>
    );
}
