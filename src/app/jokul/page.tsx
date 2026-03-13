"use client";

import {Link} from "@fremtind/jokul/link";
import {Flex} from "@fremtind/jokul/flex";
import {blogPosts} from "@/lib/blogPosts";
import {componentDocs} from "@/lib/componentDocs";
import {foundationalPosts} from "@/lib/foundationalPosts";
import {EditorialCard} from "@/components/EditorialCard/EditorialCard";
import "./home.scss";

export default function Home() {
    return (
        <main className="home">
            <header className="home__hero">
                <h1 className="home__headline">Bygg bedre<br/>med Jøkul</h1>
                <p className="home__intro">
                    Artikler, veiledninger og komponentdokumentasjon for deg som bygger
                    med Fremtinds designsystem.
                </p>
                <div className="home__disclaimer">
                    <span>⚠️ Dette er ikke den offisielle dokumentasjonen.</span>
                    {" "}
                    <Link href="https://jokul.fremtind.no/" external>
                        Gå til jokul.fremtind.no
                    </Link>
                </div>
            </header>

            <div className="home__sections">
                <EditorialCard
                    title="Siste artikler"
                    titleHref="/jokul/blog"
                    description="Dybdeartikler om tilgjengelighet, typografi, farger og komponentbruk."
                    items={blogPosts.slice(0, 2).map((p) => ({
                        key: p.id,
                        href: `/jokul/blog/${p.id}`,
                        title: p.title,
                        excerpt: p.excerpt,
                    }))}
                    stat={blogPosts.length}
                    ctaHref="/jokul/blog"
                    ctaLabel="Se alle artikler"
                />
                <EditorialCard
                    title="Konsepter"
                    titleHref="/jokul/foundational"
                    description="Fundamentene i Jøkul — typografi, farger og designtokens."
                    items={foundationalPosts.slice(0, 2).map((p) => ({
                        key: p.id,
                        href: `/jokul/foundational/${p.id}`,
                        title: p.title,
                        excerpt: p.excerpt
                    }))}
                    stat={foundationalPosts.length}
                    ctaHref="/jokul/foundational"
                    ctaLabel="Se alle"
                />
                <EditorialCard
                    title="Dokumentasjon"
                    titleHref="/jokul/component"
                    description="Prop-tabeller og kodeeksempler for alle Jøkul-komponenter."
                    items={componentDocs.slice(0, 2).map((d) => ({
                        key: d.id,
                        href: `/jokul/component/${d.id}`,
                        title: d.name,
                        excerpt: d.description,
                    }))}
                    stat={componentDocs.length}
                    ctaHref="/jokul/component"
                    ctaLabel="Se alle komponenter"
                />
            </div>

            <footer className="home__footer">
                <nav aria-label="Eksterne lenker">
                    <Flex as="ul" className="chip-list" gap="m">
                        <li><Link href="https://jokul.fremtind.no/" external>Jøkul dokumentasjon</Link></li>
                        <li><Link href="https://github.com/fremtind/jokul" external>GitHub</Link></li>
                    </Flex>
                </nav>
            </footer>
        </main>
    );
}
