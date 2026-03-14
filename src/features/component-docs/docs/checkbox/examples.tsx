import { useState, useEffect } from "react";
import { Checkbox } from "@fremtind/jokul/checkbox";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


export const examples: ComponentExample[] = [
    {
                title: "Gruppe av avkrysningsbokser",
                description: "Typisk mønster med en gruppe relaterte valg.",
                code: `<Flex direction="column" gap="xs">
      <Checkbox name="consent" value="terms" defaultChecked>
        Jeg godtar vilkårene
      </Checkbox>
      <Checkbox name="consent" value="newsletter">
        Jeg vil motta nyhetsbrev
      </Checkbox>
      <Checkbox name="consent" value="data">
        Jeg godtar lagring av data
      </Checkbox>
    </Flex>`,
                preview: (
                    <Flex direction="column" gap="xs">
                        <Checkbox name="consent" value="terms" defaultChecked>Jeg godtar vilkårene</Checkbox>
                        <Checkbox name="consent" value="newsletter">Jeg vil motta nyhetsbrev</Checkbox>
                        <Checkbox name="consent" value="data">Jeg godtar lagring av data</Checkbox>
                    </Flex>
                ),
            },
    {
                title: "Ugyldig tilstand",
                description: "Bruk invalid når brukeren prøver å sende skjema uten å ha krysset av et påkrevd felt.",
                code: `<Checkbox name="required" value="terms" invalid>
      Jeg godtar vilkårene (påkrevd)
    </Checkbox>`,
                tags: ["error-state"],
                preview: (
                    <Checkbox name="required" value="terms" invalid>
                        Jeg godtar vilkårene (påkrevd)
                    </Checkbox>
                ),
            },
    {
                title: "Indeterminate",
                description: "Indeterminate brukes typisk for en «velg alle»-avkrysningsboks når kun noen rader er valgt.",
                code: `<Flex direction="column" gap="xs">
      <Checkbox name="all" value="all" indeterminate>
        Velg alle (delvis valgt)
      </Checkbox>
      <Checkbox name="item" value="a" defaultChecked>Alternativ A</Checkbox>
      <Checkbox name="item" value="b">Alternativ B</Checkbox>
      <Checkbox name="item" value="c" defaultChecked>Alternativ C</Checkbox>
    </Flex>`,
                preview: (
                    <Flex direction="column" gap="xs">
                        <Checkbox name="all" value="all" indeterminate>Velg alle (delvis valgt)</Checkbox>
                        <Checkbox name="item" value="a" defaultChecked>Alternativ A</Checkbox>
                        <Checkbox name="item" value="b">Alternativ B</Checkbox>
                        <Checkbox name="item" value="c" defaultChecked>Alternativ C</Checkbox>
                    </Flex>
                ),
            }
];
