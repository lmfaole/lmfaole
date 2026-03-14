import { useState, useEffect } from "react";
import { SegmentedControl, SegmentedControlButton } from "@fremtind/jokul/segmented-control";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


const scValues = ["monthly", "yearly", "onetime"];


export const examples: ComponentExample[] = [
    {
                title: "Visningsvalg",
                description: "SegmentedControl for å velge mellom visningsmoduser.",
                code: `<SegmentedControl legend="Velg visning">
      <SegmentedControlButton value="list">Liste</SegmentedControlButton>
      <SegmentedControlButton value="grid">Rutenett</SegmentedControlButton>
      <SegmentedControlButton value="map">Kart</SegmentedControlButton>
    </SegmentedControl>`,
                preview: (
                    <SegmentedControl legend="Velg visning">
                        <SegmentedControlButton value="list">Liste</SegmentedControlButton>
                        <SegmentedControlButton value="grid">Rutenett</SegmentedControlButton>
                        <SegmentedControlButton value="map">Kart</SegmentedControlButton>
                    </SegmentedControl>
                ),
            },
    {
                title: "Tidsperiode",
                description: "Typisk bruk for å filtrere innhold etter tidsperiode.",
                code: `<SegmentedControl legend="Velg periode">
      <SegmentedControlButton value="day">Dag</SegmentedControlButton>
      <SegmentedControlButton value="week">Uke</SegmentedControlButton>
      <SegmentedControlButton value="month">Måned</SegmentedControlButton>
      <SegmentedControlButton value="year">År</SegmentedControlButton>
    </SegmentedControl>`,
                preview: (
                    <SegmentedControl legend="Velg periode">
                        <SegmentedControlButton value="day">Dag</SegmentedControlButton>
                        <SegmentedControlButton value="week">Uke</SegmentedControlButton>
                        <SegmentedControlButton value="month">Måned</SegmentedControlButton>
                        <SegmentedControlButton value="year">År</SegmentedControlButton>
                    </SegmentedControl>
                ),
            }
];
