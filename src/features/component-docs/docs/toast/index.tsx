import { useState, useEffect } from "react";
import { ToastProvider, useToast } from "@fremtind/jokul/toast";
import { Button } from "@fremtind/jokul/button";
import { SuccessIcon, InfoIcon, WarningIcon, ErrorIcon } from "@fremtind/jokul/icon";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "toast",
    name: "Toast",
    package: "@fremtind/jokul/toast",
    category: "Overlegg",
    status: "stable",
    description:
        "Toast er en midlertidig varslingskomponent som vises til brukeren etter en handling. Den forsvinner automatisk etter en stund og kan inneholde en handling.",
    warnings: [
        "Wrap appen i ToastProvider — useToast() vil kaste en feil hvis det kalles utenfor.",
        "Toast forsvinner automatisk — ikke bruk den for kritisk informasjon som krever brukerhandling.",
    ],
    relationships: {
        alternatives: [{ id: "message", description: "Bruk Message for vedvarende innebygd tilbakemelding som forblir synlig i sideoppsettet." }, { id: "system-message", description: "Bruk SystemMessage for beskjeder på sidenivå som krever eksplisitt brukerbekreftelse." }],
    },

    props,
    examples,
};

export default doc;
