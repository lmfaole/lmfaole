import {Flex} from "@fremtind/jokul/flex";
import {tokenPosts} from "@/app/jokul/_token/data";
import {TokenFeature} from "@/shared/components/TokenFeature";
import {PageHeader} from "@/shared/components/PageHeader";
import "./token.scss";

export const runtime = "edge";

export default function TokenPage() {
    return (
        <Flex as="main" direction="column" gap="2xl">
            <PageHeader
                title="Designtokens"
                description="Fundamentene i Jøkul — typografi, farger og spacing. Les disse for å forstå designsystemets kjerneprinsipper."
            />
            <div className="token-index__grid">
                {tokenPosts.map((post) => (
                    <TokenFeature key={post.id} post={post}/>
                ))}
            </div>
        </Flex>
    );
}
