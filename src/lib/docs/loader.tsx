"use client";
import React from "react";
import { Loader } from "@fremtind/jokul/loader";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "loader",
    name: "Loader",
    package: "@fremtind/jokul/loader",
    category: "Tilbakemelding",
    tags: ["animasjon", "feedback", "tilstandsstyring", "spinner", "laster"],
    status: "stable",
    description:
        "Loader viser en spinner-animasjon mens data hentes eller en operasjon pågår. Gi alltid textDescription for skjermlesere.",
    warnings: "Bruk delay-prop for å unngå flimmer ved operasjoner under ~300ms — en loader som blinker er verre enn ingen loader.",
    relatedIds: ["skeleton", "button", "feedback"],
    preview: (
        <Flex gap="l" alignItems="center">
            <Loader variant="small" textDescription="Laster" />
            <Loader variant="medium" textDescription="Laster" />
            <Loader variant="large" textDescription="Laster" />
        </Flex>
    ),
    props: [
        { name: "textDescription", type: "string", required: true, source: "aria", status: "stable", description: "Tilgjengelig beskrivelse for skjermlesere." },
        { name: "variant", type: '"small" | "medium" | "large"', required: false, source: "custom", status: "stable", default: '"medium"', description: "Størrelse på spinner-animasjonen." },
        { name: "delay", type: "number", required: false, source: "custom", status: "stable", default: "0", description: "Forsinkelse i ms før komponenten vises. Unngår flimmer ved raske operasjoner." },
        { name: "inline", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Viser lasteren som et inline-element, f.eks. inne i tekst." },
    ],
    examples: [
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
        },
    ],
};

export default doc;
