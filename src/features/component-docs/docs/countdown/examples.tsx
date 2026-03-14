import { Countdown } from "@fremtind/jokul/countdown";
import type { ComponentExample } from "../types";

export const examples: ComponentExample[] = [
    {
                title: "Nedtelling fra 5 minutter",
                description: "Viser en nedtelling på 5 minutter.",
                code: `<Countdown from={5 * 60 * 1000} />`,
                preview: <Countdown from={5 * 60 * 1000} />,
            },
    {
                title: "Pauset nedtelling",
                description: "Nedtelling fra 2 minutter som er satt på pause.",
                code: `<Countdown from={2 * 60 * 1000} isPaused />`,
                preview: <Countdown from={2 * 60 * 1000} isPaused />,
            },
    {
                title: "Kort nedtelling",
                description: "Nedtelling på 30 sekunder, for eksempel ved sesjonens utløp.",
                code: `<Countdown from={30 * 1000} />`,
                preview: <Countdown from={30 * 1000} />,
            }
];
