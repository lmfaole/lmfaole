"use client";

import { Button } from "@fremtind/jokul/button";
import { Flex } from "@fremtind/jokul/flex";
import "./site-header.scss";

export function SiteHeader() {
    return (
        <header className="site-header" role="banner">
            <Flex className="site-header__inner" alignItems="center" justifyContent="space-between">
                <Button as="a" href="/jokul" variant="ghost">Jøkul</Button>
                <Flex as="nav" aria-label="Primærnavigasjon" className="site-header__nav">
                    <Button as="a" href="/jokul/token" variant="ghost">Designtokens</Button>
                    <Button as="a" href="/jokul/component" variant="ghost">Komponenter</Button>
                </Flex>
            </Flex>
        </header>
    );
}
