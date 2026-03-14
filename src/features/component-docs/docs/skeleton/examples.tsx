import { useState, useEffect, useCallback } from "react";
import { SkeletonAnimation, SkeletonElement, SkeletonInput, SkeletonButton, SkeletonTextArea, SkeletonCheckboxGroup, SkeletonRadioButtonGroup } from "@fremtind/jokul/loader";
import { Flex } from "@fremtind/jokul/flex";
import { Button } from "@fremtind/jokul/button";
import { CardBasicPreview } from "../card/examples";
import { TableBasicPreview } from "../table/examples";
import { DescriptionListContactPreview } from "../description-list/examples";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


function SkeletonFormPreview() {
    return (
        <SkeletonAnimation textDescription="Laster skjema…" style={{ maxWidth: "24rem" }}>
            <Flex direction="column" gap="m">
                <SkeletonInput />
                <SkeletonInput />
                <SkeletonTextArea />
                <SkeletonButton width="8rem" />
            </Flex>
        </SkeletonAnimation>
    );
}

function SkeletonListPreview() {
    return (
        <SkeletonAnimation textDescription="Laster innhold…" style={{ maxWidth: "32rem" }}>
            <Flex direction="column" gap="s">
                {[1, 2, 3].map((i) => (
                    <SkeletonElement key={i} width="100%" height="4rem" />
                ))}
            </Flex>
        </SkeletonAnimation>
    );
}


function useReloadTimer(delayMs = 4000) {
    const [loaded, setLoaded] = useState(false);
    const load = useCallback(() => {
        setLoaded(false);
        setTimeout(() => setLoaded(true), delayMs);
    }, [delayMs]);
    useEffect(() => { load(); }, [load]);
    return { loaded, load };
}
function SkeletonCardPreview() {
    const { loaded, load } = useReloadTimer();
    return (
        <Flex direction="column" gap="m" style={{ maxWidth: "28rem" }}>
            <div style={{ position: "relative" }}>
                <div style={{ visibility: loaded ? "visible" : "hidden" }}>
                    <CardBasicPreview />
                </div>
                {!loaded && (
                    <div style={{ position: "absolute", inset: 0 }}>
                        <SkeletonAnimation textDescription="Laster kort…" className="jkl-card jkl-card--high" style={{ height: "100%", padding: "var(--jkl-spacing-l)" }}>
                            <Flex direction="column" gap="s">
                                <SkeletonElement width="60%" height="2rem" />
                                <SkeletonElement width="100%" height="1.5rem" />
                                <Flex gap="s">
                                    <SkeletonButton width="5rem" />
                                    <SkeletonButton width="7rem" />
                                </Flex>
                            </Flex>
                        </SkeletonAnimation>
                    </div>
                )}
            </div>
            <Button variant="secondary" onClick={load}>Last på nytt</Button>
        </Flex>
    );
}

function SkeletonTablePreview() {
    const { loaded, load } = useReloadTimer();
    return (
        <Flex direction="column" gap="m">
            <div style={{ position: "relative" }}>
                <div style={{ visibility: loaded ? "visible" : "hidden" }}>
                    <TableBasicPreview />
                </div>
                {!loaded && (
                    <div style={{ position: "absolute", inset: 0 }}>
                        <SkeletonAnimation textDescription="Laster tabell…" style={{ background: "var(--jkl-color-background-container-high)", borderRadius: "4px", padding: "var(--jkl-spacing-s)" }}>
                            <Flex direction="column" gap="xs">
                                <SkeletonElement width="100%" height="3rem" />
                                <SkeletonElement width="100%" height="3rem" />
                                <SkeletonElement width="100%" height="3rem" />
                            </Flex>
                        </SkeletonAnimation>
                    </div>
                )}
            </div>
            <Button variant="secondary" onClick={load}>Last på nytt</Button>
        </Flex>
    );
}

function SkeletonDescriptionListPreview() {
    const { loaded, load } = useReloadTimer();
    return (
        <Flex direction="column" gap="m" style={{ maxWidth: "20rem" }}>
            <div style={{ position: "relative" }}>
                <div style={{ visibility: loaded ? "visible" : "hidden" }}>
                    <DescriptionListContactPreview />
                </div>
                {!loaded && (
                    <div style={{ position: "absolute", inset: 0 }}>
                        <SkeletonAnimation textDescription="Laster kontaktinfo…" style={{ background: "var(--jkl-color-background-container-high)", borderRadius: "4px", padding: "var(--jkl-spacing-m)" }}>
                            <Flex direction="column" gap="xs">
                                <SkeletonElement width="5rem" height="0.875rem" />
                                <SkeletonElement width="10rem" height="1.25rem" />
                                <SkeletonElement width="4rem" height="0.875rem" />
                                <SkeletonElement width="12rem" height="1.25rem" />
                                <SkeletonElement width="5rem" height="0.875rem" />
                                <SkeletonElement width="9rem" height="1.25rem" />
                            </Flex>
                        </SkeletonAnimation>
                    </div>
                )}
            </div>
            <Button variant="secondary" onClick={load}>Last på nytt</Button>
        </Flex>
    );
}


export const examples: ComponentExample[] = [
    {
                title: "Skjema",
                description: "SkeletonInput, SkeletonTextArea og SkeletonButton matcher vanlige skjemaelementer og gir et troverdig skjelett.",
                code: `<SkeletonAnimation textDescription="Laster skjema…" style={{ maxWidth: "24rem" }}>
      <Flex direction="column" gap="m">
        <SkeletonInput />
        <SkeletonInput />
        <SkeletonTextArea />
        <SkeletonButton width="8rem" />
      </Flex>
    </SkeletonAnimation>`,
                preview: <SkeletonFormPreview />,
            },
    {
                title: "Kortliste",
                description: "SkeletonElement brukes for freeform rektangulære plassholdere, f.eks. kort eller bildeflater.",
                code: `<SkeletonAnimation textDescription="Laster innhold…" style={{ maxWidth: "32rem" }}>
      <Flex direction="column" gap="s">
        {[1, 2, 3].map((i) => (
          <SkeletonElement key={i} width="100%" height="4rem" />
        ))}
      </Flex>
    </SkeletonAnimation>`,
                preview: <SkeletonListPreview />,
            },
    {
                title: "Valggrupper",
                description: "SkeletonCheckboxGroup og SkeletonRadioButtonGroup matcher flervalgslister eksakt.",
                code: `<SkeletonAnimation textDescription="Laster valg…">
      <Flex gap="xl">
        <SkeletonCheckboxGroup checkboxes={3} />
        <SkeletonRadioButtonGroup radioButtons={3} />
      </Flex>
    </SkeletonAnimation>`,
                preview: (
                    <SkeletonAnimation textDescription="Laster valg…">
                        <Flex gap="xl">
                            <SkeletonCheckboxGroup checkboxes={3} />
                            <SkeletonRadioButtonGroup radioButtons={3} />
                        </Flex>
                    </SkeletonAnimation>
                ),
            },
    {
                title: "Kort",
                description: "Skjelettet overlay-es over kortet som alltid er rendret — dette eliminerer layout-shift når innholdet vises.",
                uses: ["card", "flex", "button"],
                code: `const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      setTimeout(() => setLoaded(true), 2000);
    }, []);

    return (
      <div style={{ position: "relative" }}>
        <div style={{ visibility: loaded ? "visible" : "hidden" }}>
          <Card padding="l">…</Card>
        </div>
        {!loaded && (
          <div style={{ position: "absolute", inset: 0 }}>
            <SkeletonAnimation textDescription="Laster kort…" style={{ padding: "var(--jkl-spacing-l)" }}>
              <SkeletonElement width="60%" height="2rem" />
              <SkeletonElement width="100%" height="1.5rem" />
              <SkeletonButton width="5rem" />
            </SkeletonAnimation>
          </div>
        )}
      </div>
    );`,
                preview: <SkeletonCardPreview />,
            },
    {
                title: "Tabell",
                description: "Tre rader med SkeletonElement-plassholdere erstattes av den virkelige tabellen.",
                uses: ["table"],
                code: `const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      setTimeout(() => setLoaded(true), 2000);
    }, []);

    return (
      <div style={{ position: "relative" }}>
        <div style={{ visibility: loaded ? "visible" : "hidden" }}>
          <Table caption="Forsikringsavtaler">…</Table>
        </div>
        {!loaded && (
          <div style={{ position: "absolute", inset: 0 }}>
            <SkeletonAnimation textDescription="Laster tabell…">
              <SkeletonElement width="100%" height="3rem" />
              <SkeletonElement width="100%" height="3rem" />
              <SkeletonElement width="100%" height="3rem" />
            </SkeletonAnimation>
          </div>
        )}
      </div>
    );`,
                preview: <SkeletonTablePreview />,
            },
    {
                title: "Kontaktinformasjon",
                description: "Skeleton-par (nøkkel + verdi) avspeiler DescriptionList-strukturen.",
                uses: ["description-list"],
                code: `const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      setTimeout(() => setLoaded(true), 2000);
    }, []);

    return (
      <div style={{ position: "relative" }}>
        <div style={{ visibility: loaded ? "visible" : "hidden" }}>
          <DescriptionList>…</DescriptionList>
        </div>
        {!loaded && (
          <div style={{ position: "absolute", inset: 0 }}>
            <SkeletonAnimation textDescription="Laster kontaktinfo…">
              {[...Array(3)].map((_, i) => (
                <React.Fragment key={i}>
                  <SkeletonElement width="5rem" height="0.875rem" />
                  <SkeletonElement width="10rem" height="1.25rem" />
                </React.Fragment>
              ))}
            </SkeletonAnimation>
          </div>
        )}
      </div>
    );`,
                preview: <SkeletonDescriptionListPreview />,
            },
    {
                title: "Avatarer og ikoner",
                description: "Bruk SkeletonElement med shape=\"circle\" for sirkulære plassholdere som avatarer.",
                code: `<SkeletonAnimation textDescription="Laster brukere…">
      <Flex gap="m" alignItems="center">
        <SkeletonElement width="3rem" height="3rem" shape="circle" />
        <Flex direction="column" gap="xs">
          <SkeletonElement width="10rem" height="1rem" />
          <SkeletonElement width="7rem" height="1rem" />
        </Flex>
      </Flex>
    </SkeletonAnimation>`,
                preview: (
                    <SkeletonAnimation textDescription="Laster brukere…">
                        <Flex gap="m" alignItems="center">
                            <SkeletonElement width="3rem" height="3rem" shape="circle" />
                            <Flex direction="column" gap="xs">
                                <SkeletonElement width="10rem" height="1rem" />
                                <SkeletonElement width="7rem" height="1rem" />
                            </Flex>
                        </Flex>
                    </SkeletonAnimation>
                ),
            }
];
