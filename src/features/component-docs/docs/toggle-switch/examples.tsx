import { useState, useEffect } from "react";
import { ToggleSwitch } from "@fremtind/jokul/toggle-switch";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


export const examples: ComponentExample[] = [
    {
                title: "Grunnleggende bruk",
                description: "Et ukontrollert eksempel. I produksjon vil du typisk bruke checked + onChange fra React-state.",
                code: `<ToggleSwitch defaultChecked>
      Aktiver varsler
    </ToggleSwitch>`,
                preview: (
                    <ToggleSwitch defaultChecked>
                        Aktiver varsler
                    </ToggleSwitch>
                ),
            },
    {
                title: "Gruppe av innstillinger",
                description: "Grupper relaterte bryterinnstillinger i en Flex-kolonne med konsistent gap.",
                code: `<Flex direction="column" gap="s">
      <ToggleSwitch defaultChecked>
        E-postvarsler
      </ToggleSwitch>
      <ToggleSwitch>
        SMS-varsler
      </ToggleSwitch>
      <ToggleSwitch defaultChecked>
        Push-varsler
      </ToggleSwitch>
    </Flex>`,
                preview: (
                    <Flex direction="column" gap="s">
                        <ToggleSwitch defaultChecked>E-postvarsler</ToggleSwitch>
                        <ToggleSwitch>SMS-varsler</ToggleSwitch>
                        <ToggleSwitch defaultChecked>Push-varsler</ToggleSwitch>
                    </Flex>
                ),
            }
];
