"use client";
import { useState, useEffect } from "react";
import { SkeletonAnimation, SkeletonInput, SkeletonButton, SkeletonElement, SkeletonCheckboxGroup, SkeletonRadioButtonGroup, SkeletonTextArea } from "@fremtind/jokul/loader";
import { Flex } from "@fremtind/jokul/flex";
import { Button } from "@fremtind/jokul/button";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function SkeletonInputPreview() {
    return <SkeletonAnimation textDescription="Laster…"><SkeletonInput /></SkeletonAnimation>;
}

export function SkeletonButtonPreview() {
    return <SkeletonAnimation textDescription="Laster…"><SkeletonButton width="8rem" /></SkeletonAnimation>;
}

export function SkeletonElementPreview() {
    return <SkeletonAnimation textDescription="Laster…"><SkeletonElement height="2rem" width="12rem" /></SkeletonAnimation>;
}

export function SkeletonCheckboxGroupPreview() {
    return <SkeletonAnimation textDescription="Laster…"><SkeletonCheckboxGroup checkboxes={3} /></SkeletonAnimation>;
}

export function SkeletonRadioButtonGroupPreview() {
    return <SkeletonAnimation textDescription="Laster…"><SkeletonRadioButtonGroup radioButtons={3} /></SkeletonAnimation>;
}

export function SkeletonTextAreaPreview() {
    return <SkeletonAnimation textDescription="Laster…"><SkeletonTextArea /></SkeletonAnimation>;
}

export function SkeletonPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);
    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 2), 2000);
        return () => clearInterval(id);
    }, [isHovered]);

    if (step === 1) {
        return (
            <div style={{ maxWidth: "320px" }}>
                <Flex direction="column" gap="m">
                    <p style={{ margin: 0, fontWeight: "bold" }}>Bilforsikring kasko</p>
                    <p style={{ margin: 0 }}>Månedspremie: 542 kr</p>
                    <div style={{ width: "8rem" }}><Button variant="secondary">Se detaljer</Button></div>
                </Flex>
            </div>
        );
    }
    return (
        <SkeletonAnimation textDescription="Laster innhold…" style={{ maxWidth: "320px" }}>
            <Flex direction="column" gap="m">
                <SkeletonInput />
                <SkeletonInput />
                <SkeletonButton width="8rem" />
            </Flex>
        </SkeletonAnimation>
    );
}
