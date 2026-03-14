import { Link } from "@fremtind/jokul/link";
import { LinkList } from "@fremtind/jokul/link-list";
import { FullBleed } from "@/shared/components/FullBleed/FullBleed";
import "./site-footer.scss";

export function SiteFooter() {
    return (
        <FullBleed as="footer" dots="fade-top" className="site-footer">
            <div className="site-footer__inner">
                <div className="site-footer__grid">
                    <div className="site-footer__col">
                        <p className="site-footer__about">
                            En uoffisiell læringsressurs for Jøkul — Fremtinds designsystem.
                            Innholdet er ikke en del av det offisielle Jøkul-prosjektet.
                        </p>
                    </div>

                    <nav className="site-footer__col" aria-label="Innhold på denne siden">
                        <LinkList label="Innhold">
                            <LinkList.Link href="/jokul/blog">Blogg</LinkList.Link>
                            <LinkList.Link href="/jokul/foundational">Grunnleggende</LinkList.Link>
                            <LinkList.Link href="/jokul/component">Komponenter</LinkList.Link>
                        </LinkList>
                    </nav>

                    <nav className="site-footer__col" aria-label="Offisielle Jøkul-ressurser">
                        <LinkList label="Jøkul">
                            <LinkList.Link href="https://jokul.fremtind.no/" target="_blank" rel="noopener noreferrer">Dokumentasjon</LinkList.Link>
                            <LinkList.Link href="https://jokul.fremtind.no/kom-i-gang/introduksjon/" target="_blank" rel="noopener noreferrer">Kom i gang</LinkList.Link>
                            <LinkList.Link href="https://jokul.fremtind.no/profil/designprinsipper/" target="_blank" rel="noopener noreferrer">Stilguide og profil</LinkList.Link>
                            <LinkList.Link href="https://jokul.fremtind.no/komponenter/buttons/" target="_blank" rel="noopener noreferrer">Komponentbibliotek</LinkList.Link>
                            <LinkList.Link href="https://github.com/fremtind/jokul" target="_blank" rel="noopener noreferrer">GitHub</LinkList.Link>
                        </LinkList>
                    </nav>
                </div>

                <p className="site-footer__disclaimer">
                    Ikke tilknyttet Fremtind eller det offisielle Jøkul-prosjektet.
                </p>
            </div>
        </FullBleed>
    );
}
