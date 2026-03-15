import { Flex } from "@fremtind/jokul/flex";
import { PageHero } from "@/shared/components/PageHero/PageHero";
import { NotFound } from "@/shared/components/NotFound";
import { getPatternPost } from "@/app/jokul/_pattern/data";
import { getComponentDoc } from "@/app/jokul/_component-docs/data";
import { RelatedComponentsTable } from "@/app/jokul/_component-docs/components/RelatedComponentsTable";
import { Grid } from "@/shared/components/Grid";
import { TokenFeature } from "@/shared/components/TokenFeature";
import { getTokenPostById } from "@/app/jokul/_token/data";
import type { ResolvedRelationship } from "@/app/jokul/_component-docs/data";
import { DotsIllustration } from "@/shared/components/Illustration";

export const runtime = "edge";

type Awaitable<T> = T | Promise<T>;

interface PatternPageProps {
    params: Awaitable<{ id: string }>;
    searchParams?: Awaitable<{ id?: string }>;
}

export default async function PatternPage({ params, searchParams }: PatternPageProps) {
    // Next can provide `params`/`searchParams` as Promises (sync dynamic APIs).
    const resolvedParams = await params;
    const resolvedSearchParams = await Promise.resolve(searchParams);

    // Also try `searchParams.id` since some runtimes may mirror dynamic params into the query string.
    const candidates = [resolvedParams.id, resolvedSearchParams?.id].filter(Boolean) as string[];
    const post = candidates.map((id) => getPatternPost(id)).find(Boolean);

    if (!post) {
        return (
            <NotFound
                message="Fant ikke mønsteret"
                backHref="/jokul/monster"
                backLabel="Tilbake til alle mønstre"
            />
        );
    }

    const { default: Content } = await post.content();

    const relatedComponents: ResolvedRelationship[] = (post.relatedComponents ?? []).flatMap((id) => {
        const doc = getComponentDoc(id);
        return doc ? [{ doc, description: doc.description.short }] : [];
    });

    const relatedTokens = (post.relatedTokens ?? []).flatMap((id) => {
        const token = getTokenPostById(id);
        return token ? [token] : [];
    });

    const background = post.illustration ?? <DotsIllustration />;

    return (
        <Flex as="main" direction="column" gap="xl">
            <PageHero title={post.title} description={post.excerpt} background={background} />

            <Flex as="article" className="post-prose" direction="column" gap="l">
                <Content />
            </Flex>

            {relatedComponents.length > 0 && (
                <Flex as="section" direction="column" gap="m">
                    <h2>Relaterte komponenter</h2>
                    <RelatedComponentsTable items={relatedComponents} />
                </Flex>
            )}

            {relatedTokens.length > 0 && (
                <Flex as="section" direction="column" gap="m">
                    <h2>Relaterte tokens</h2>
                    <Grid columns={4} gap="m">
                        {relatedTokens.map((token) => (
                            <TokenFeature key={token.id} post={token} />
                        ))}
                    </Grid>
                </Flex>
            )}
        </Flex>
    );
}
