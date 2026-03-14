import { Message } from "@fremtind/jokul/message";
import { MotionIllustration } from "@/features/foundational/components/FoundationalIllustration";
import { MotionPreview } from "@/features/foundational/components/MotionPreview";
import { timingTokens, easingTokens } from "./tokens";
import { motionMixins } from "./mixins";
import type { FoundationalPost } from "../types";

const post: FoundationalPost = {
  id: 13,
  title: "Animasjon og bevegelse i Jøkul",
  excerpt:
    "Lær hvordan Jøkul bruker timing- og easing-tokens for å skape konsistent, meningsfull bevegelse — og hvordan du respekterer brukere som foretrekker redusert bevegelse.",
  tokenOverview: [
    {
      heading: "Timing",
      description:
        "Fem navngitte varigheter fra øyeblikkelig til rolig. Velg timing basert på hvor mye oppmerksomhet interaksjonen fortjener.",
      caption: "Timing-tokens — varighet i millisekunder",
      columns: ["Animasjon", "Token", "Verdi", "Bruksområde"],
      rows: timingTokens.map(({ token, value, usage }) => [
        <MotionPreview key={`${token}-prev`} timing={token} easing="--jkl-motion-easing-entrance" />,
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
      rows: easingTokens.map(({ token, curve, usage }) => [
        <MotionPreview key={`${token}-prev`} timing="--jkl-motion-timing-expressive" easing={token} />,
        <code key={`${token}-code`}>{token}</code>,
        curve,
        usage,
      ]),
    },
  ],
  content: (
    <>
      <p>
        Bevegelse i grensesnitt skal alltid ha et formål: den skal forklare hva som skjer, lede
        oppmerksomheten, eller bekrefte en handling. Jøkul definerer et sett med timing- og
        easing-tokens som gjør det enkelt å velge riktig følelse for hvert interaksjonsmønster.
      </p>

      <Message variant="info">
        Alle bevegelsestokens er eksponert som CSS-variabler og kan brukes direkte i{" "}
        <code>transition</code>, <code>animation</code> og Framer Motion-konfigurasjon.
      </Message>
    </>
  ),
  scssSection: motionMixins,
  illustration: <MotionIllustration />,
  relatedComponents: [],
  resources: [
    {
      title: "Jøkul Motion — Storybook",
      url: "https://jokul.fremtind.no/",
      description: "Interaktiv oversikt over alle bevegelsestokens",
    },
    {
      title: "Material Design: Motion",
      url: "https://m3.material.io/styles/motion/overview",
      description: "God innføring i prinsippene bak meningsfull UI-animasjon",
    },
    {
      title: "MDN: prefers-reduced-motion",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion",
      description: "Referanse til tilgjengelighetsmediespørringen for redusert bevegelse",
    },
  ],
};

export default post;
