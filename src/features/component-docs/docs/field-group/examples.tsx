import { useState, useEffect } from "react";
import { FieldGroup } from "@fremtind/jokul/input-group";
import { Checkbox } from "@fremtind/jokul/checkbox";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


export const examples: ComponentExample[] = [
    {
                title: "Gruppe av avkrysningsbokser",
                description: "FieldGroup gir semantisk gruppering og felles legend.",
                code: `<FieldGroup legend="Hva ønsker du å forsikre?">
      <Checkbox name="product" value="car">Bil</Checkbox>
      <Checkbox name="product" value="home">Bolig</Checkbox>
      <Checkbox name="product" value="travel">Reise</Checkbox>
    </FieldGroup>`,
                tags: ["accessibility"],
                preview: (
                    <FieldGroup legend="Hva ønsker du å forsikre?">
                        <Checkbox name="product" value="car">Bil</Checkbox>
                        <Checkbox name="product" value="home">Bolig</Checkbox>
                        <Checkbox name="product" value="travel">Reise</Checkbox>
                    </FieldGroup>
                ),
            },
    {
                title: "Med feilmelding",
                description: "FieldGroup viser en felles feilmelding for hele gruppen.",
                code: `<FieldGroup
      legend="Hva ønsker du å forsikre?"
      errorLabel="Velg minst ett alternativ"
    >
      <Checkbox name="product2" value="car">Bil</Checkbox>
      <Checkbox name="product2" value="home">Bolig</Checkbox>
      <Checkbox name="product2" value="travel">Reise</Checkbox>
    </FieldGroup>`,
                tags: ["error-state"],
                preview: (
                    <FieldGroup legend="Hva ønsker du å forsikre?" errorLabel="Velg minst ett alternativ">
                        <Checkbox name="product2" value="car">Bil</Checkbox>
                        <Checkbox name="product2" value="home">Bolig</Checkbox>
                        <Checkbox name="product2" value="travel">Reise</Checkbox>
                    </FieldGroup>
                ),
            },
    {
                title: "Med hjelpetekst",
                description: "FieldGroup med hjelpetekst som gir ekstra kontekst til valgene.",
                code: `<FieldGroup
      legend="Betalingsfrekvens"
      helpLabel="Velg hvor ofte du ønsker å betale forsikringen."
    >
      <Checkbox name="frequency" value="monthly">Månedlig</Checkbox>
      <Checkbox name="frequency" value="quarterly">Kvartalsvis</Checkbox>
      <Checkbox name="frequency" value="yearly">Årlig</Checkbox>
    </FieldGroup>`,
                preview: (
                    <FieldGroup
                        legend="Betalingsfrekvens"
                        helpLabel="Velg hvor ofte du ønsker å betale forsikringen."
                    >
                        <Checkbox name="frequency" value="monthly">Månedlig</Checkbox>
                        <Checkbox name="frequency" value="quarterly">Kvartalsvis</Checkbox>
                        <Checkbox name="frequency" value="yearly">Årlig</Checkbox>
                    </FieldGroup>
                ),
            }
];
