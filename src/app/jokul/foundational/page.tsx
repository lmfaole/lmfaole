"use client";

import { Flex } from "@fremtind/jokul/flex";
import { foundationalPosts } from "@/features/foundational/data";
import { FoundationalCard } from "@/shared/components/FoundationalCard/FoundationalCard";
import "./foundational.scss";

export default function FoundationalPage() {
    return (
        <Flex as="main" direction="column" gap="2xl">            <header className="foundational-index__header">
                <h1>Grunnleggende</h1>
                <p>Fundamentene i Jøkul — typografi, farger og spacing. Les disse for å forstå designsystemets kjerneprinsipper.</p>
            </header>
            <div className="foundational-index__list">
                {foundationalPosts.map((post) => (
                    <FoundationalCard key={post.id} post={post} />
                ))}
            </div>
        </Flex>
    );
}
