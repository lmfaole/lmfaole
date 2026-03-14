import { useState, useEffect } from "react";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


const ICON_NAMES = ["home", "person", "check_circle", "warning", "download", "arrow_forward", "settings", "favorite", "search", "shield"];


export const examples: ComponentExample[] = [
    {
                title: "Vanlige ikoner",
                description: "Eksempler på ikoner fra Material Symbols-biblioteket.",
                code: `<Flex gap="m" alignItems="center">
      <Icon>home</Icon>
      <Icon>settings</Icon>
      <Icon>arrow_forward</Icon>
      <Icon>check_circle</Icon>
      <Icon>warning</Icon>
    </Flex>`,
                preview: (
                    <Flex gap="m" alignItems="center">
                        <Icon>home</Icon>
                        <Icon>settings</Icon>
                        <Icon>arrow_forward</Icon>
                        <Icon>check_circle</Icon>
                        <Icon>warning</Icon>
                    </Flex>
                ),
            },
    {
                title: "Fylt og fet variant",
                description: "Bruk filled for fylt versjon og bold for tykkere strekbredde.",
                code: `<Flex gap="m" alignItems="center">
      <Icon>favorite</Icon>
      <Icon filled>favorite</Icon>
      <Icon bold>favorite</Icon>
    </Flex>`,
                preview: (
                    <Flex gap="m" alignItems="center">
                        <Icon>favorite</Icon>
                        <Icon filled>favorite</Icon>
                        <Icon bold>favorite</Icon>
                    </Flex>
                ),
            }
];
