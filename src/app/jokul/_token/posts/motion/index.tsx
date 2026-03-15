import {MotionIllustration} from "@/shared/components/Illustration";
import {MotionPreview} from "@/app/jokul/_token/components/MotionPreview";
import {easingTokens, timingTokens} from "./tokens";
import {motionMixins} from "./mixins";
import type {TokenPost} from "../types";

const post: TokenPost = {
    id: 13,
    title: "Animasjon",
    excerpt:
        "Lær hvordan Jøkul bruker timing- og easing-tokens for å skape konsistent, meningsfull bevegelse — og hvordan du respekterer brukere som foretrekker redusert bevegelse.",
    tokenOverview: [
        {
            heading: "Timing",
            description:
                "Fem navngitte varigheter fra øyeblikkelig til rolig. Velg timing basert på hvor mye oppmerksomhet interaksjonen fortjener.",
            caption: "Timing-tokens — varighet i millisekunder",
            columns: ["Animasjon", "Token", "Verdi", "Bruksområde"],
            rows: timingTokens.map(({token, value, usage}) => [
                <MotionPreview key={`${token}-prev`} timing={token} easing="--jkl-motion-easing-entrance"/>,
                <code key={`${token}-code`}>{token}</code>,
                value,
                usage,
            ]),
        },
        {
            heading: "Easing",
            description:
                "Fire navngitte kurver som gir bevegelse karakter og retning. Kombinér alltid en easing-token med en timing-token.",
            caption: "Easing-tokens — animasjonskurver",
            columns: ["Animasjon", "Token", "Kurve", "Bruksområde"],
            rows: easingTokens.map(({token, curve, usage}) => [
                <MotionPreview key={`${token}-prev`} timing="--jkl-motion-timing-expressive" easing={token}/>,
                <code key={`${token}-code`}>{token}</code>,
                curve,
                usage,
            ]),
        },
    ],
    scssSection: motionMixins,
    illustration: <MotionIllustration/>,
    relatedComponents: [],
    resources: [
        { title: "Jøkul Motion — Storybook", url: "https://jokul.fremtind.no/" },
        { title: "Material Design: Motion", url: "https://m3.material.io/styles/motion/overview" },
        { title: "MDN: prefers-reduced-motion", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion" },
        { title: "MDN: transition-timing-function", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function" },
        { title: "MDN: animation", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/animation" },
        { title: "WCAG 2.1 — 2.3.3: Animation from Interactions", url: "https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html" },
        { title: "The Illusion of Life: Disney Animation", url: "https://en.wikipedia.org/wiki/The_Illusion_of_Life:_Disney_Animation" },
    ],
};

export default post;
