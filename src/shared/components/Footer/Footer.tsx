import { Link } from "@fremtind/jokul/link";
import { Flex } from "@fremtind/jokul/flex";
import { FullBleed } from "@/shared/components/FullBleed/FullBleed";
import "./footer.scss";

export function Footer() {
    return (
        <FullBleed as="footer" dots className="site-footer">
            <div className="site-footer__inner">
                <div className="site-footer__grid">
                    <div className="site-footer__col">
                        <p className="site-footer__about">
                            En uoffisiell læringsressurs for Jøkul — Fremtinds designsystem.
                            Innholdet er ikke en del av det offisielle Jøkul-prosjektet.
                        </p>
                    </div>

                    <nav className="site-footer__col" aria-label="Innhold på denne siden">
                        <h2 className="site-footer__heading">Innhold</h2>
                        <Flex as="ul" className="list-bare" direction="column" gap="xs">
                            <li><Link href="/jokul/token">Designtokens</Link></li>
                            <li><Link href="/jokul/component">Komponenter</Link></li>
                        </Flex>
                    </nav>

                    <nav className="site-footer__col" aria-label="Offisielle Jøkul-ressurser">
                        <h2 className="site-footer__heading">Jøkul</h2>
                        <Flex as="ul" className="list-bare" direction="column" gap="xs">
                            <li>
                                <Link href="https://jokul.fremtind.no/" external>
                                    Dokumentasjon
                                </Link>
                            </li>
                            <li>
                                <Link href="https://jokul.fremtind.no/kom-i-gang/introduksjon/" external>
                                    Kom i gang
                                </Link>
                            </li>
                            <li>
                                <Link href="https://jokul.fremtind.no/profil/designprinsipper/" external>
                                    Stilguide og profil
                                </Link>
                            </li>
                            <li>
                                <Link href="https://jokul.fremtind.no/komponenter/buttons/" external>
                                    Komponentbibliotek
                                </Link>
                            </li>
                            <li>
                                <Link href="https://github.com/fremtind/jokul" external>
                                    GitHub
                                </Link>
                            </li>
                        </Flex>
                    </nav>
                </div>

                <p className="site-footer__disclaimer">
                    Ikke tilknyttet Fremtind eller det offisielle Jøkul-prosjektet.
                </p>
            </div>
        </FullBleed>
    );
}
