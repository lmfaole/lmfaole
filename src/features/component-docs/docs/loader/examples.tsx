import { Loader } from "@fremtind/jokul/loader";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentExample } from "../types";

export const examples: ComponentExample[] = [
    {
                title: "Størrelser",
                description: "Loader finnes i tre størrelser: small, medium og large.",
                code: `<Flex gap="l" alignItems="center">
      <Loader variant="small" textDescription="Laster" />
      <Loader variant="medium" textDescription="Laster" />
      <Loader variant="large" textDescription="Laster" />
    </Flex>`,
                preview: (
                    <Flex gap="l" alignItems="center">
                        <Loader variant="small" textDescription="Laster" />
                        <Loader variant="medium" textDescription="Laster" />
                        <Loader variant="large" textDescription="Laster" />
                    </Flex>
                ),
            },
    {
                title: "Inline",
                description: "Bruk inline for å vise lasteren som en del av løpende tekst eller ved siden av en label.",
                code: `<Flex gap="s" alignItems="center">
      <Loader variant="small" inline textDescription="Henter data" />
      <span>Henter forsikringsinformasjon…</span>
    </Flex>`,
                preview: (
                    <Flex gap="s" alignItems="center">
                        <Loader variant="small" inline textDescription="Henter data" />
                        <span>Henter forsikringsinformasjon…</span>
                    </Flex>
                ),
            }
];
