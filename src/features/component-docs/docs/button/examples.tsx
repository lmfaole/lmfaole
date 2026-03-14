import { useState, useEffect } from "react";
import { Button } from "@fremtind/jokul/button";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


export const examples: ComponentExample[] = [
    {
                title: "Primær handling",
                description: "Standard bruk — én primary-knapp per kontekst for den viktigste handlingen.",
                code: `<Button variant="primary">Send inn søknad</Button>`,
                preview: <Button variant="primary">Send inn søknad</Button>,
            },
    {
                title: "Varianter",
                description: "Bruk primary for den viktigste handlingen. secondary og ghost for støttehandlinger. tertiary for lavprioriterte lenke-lignende handlinger.",
                code: `<Flex gap="s" wrap="wrap">
      <Button variant="primary">Lagre endringer</Button>
      <Button variant="secondary">Avbryt</Button>
      <Button variant="ghost">Slett</Button>
      <Button variant="tertiary">Vis mer</Button>
    </Flex>`,
                preview: (
                    <Flex gap="s" wrap="wrap">
                        <Button variant="primary">Lagre endringer</Button>
                        <Button variant="secondary">Avbryt</Button>
                        <Button variant="ghost">Slett</Button>
                        <Button variant="tertiary">Vis mer</Button>
                    </Flex>
                ),
            },
    {
                title: "Med ikon",
                description: "Bruk icon-propen med en Icon-komponent. iconPosition styrer om ikonet vises til venstre (standard) eller høyre for teksten.",
                code: `<Flex gap="s" wrap="wrap">
      <Button variant="primary" icon={<Icon>add</Icon>}>
        Ny forsikring
      </Button>
      <Button variant="secondary" icon={<Icon>download</Icon>} iconPosition="left">
        Last ned
      </Button>
      <Button variant="ghost" icon={<Icon>arrow_forward</Icon>} iconPosition="right">
        Se alle
      </Button>
    </Flex>`,
                uses: ["icon"],
                preview: (
                    <Flex gap="s" wrap="wrap">
                        <Button variant="primary" icon={<Icon>add</Icon>}>
                            Ny forsikring
                        </Button>
                        <Button variant="secondary" icon={<Icon>download</Icon>} iconPosition="left">
                            Last ned
                        </Button>
                        <Button variant="ghost" icon={<Icon>arrow_forward</Icon>} iconPosition="right">
                            Se alle
                        </Button>
                    </Flex>
                ),
            },
    {
                title: "Lasteindikator",
                description: "Bruk loader når en handling tar tid. Gi alltid textDescription for skjermlesere.",
                code: `<Button loader={{ showLoader: true, textDescription: "Lagrer endringer" }}>
      Lagrer…
    </Button>`,
                preview: (
                    <Button loader={{ showLoader: true, textDescription: "Lagrer endringer" }}>
                        Lagrer…
                    </Button>
                ),
            },
    {
                title: "Deaktivert tilstand",
                description: "Bruk disabled med varsomhet.",
                code: `<Flex gap="s">
      <Button disabled>Kan ikke lagres</Button>
      <Button variant="secondary" disabled>Slett</Button>
    </Flex>`,
                tags: ["disabled"],
                preview: (
                    <Flex gap="s">
                        <Button disabled>Kan ikke lagres</Button>
                        <Button variant="secondary" disabled>Slett</Button>
                    </Flex>
                ),
            }
];
