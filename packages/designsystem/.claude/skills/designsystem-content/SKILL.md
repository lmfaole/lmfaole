---
name: designsystem-content
description: Use when writing or changing any text a person reads or hears in a page or component built with the design system - titles, labels, button and link text, aria-labels and alt text, counts, dates and numbers, empty states, error messages, notifications and AI-made text. On-screen text is Norwegian bokmål.
---

# Content with the design system

Code and comments are English; **on-screen text is Norwegian bokmål** (rule 9). Words are design material, not decoration: write the
real words before the layout is final, and test them with real people when you can (Designsystemet, «Skriveråd»).

## Principles

- **Write from the reader's side of the screen.** Name things by what people recognise («Venter på din review»), not by how the
  system is built.
- **Short and specific.** Titles are short noun phrases («Pull requests», «Klar til merge»), not sentences. Prefer specific to clever.
  Start with less: put the important words first and cut the rest («Totalt», not «Dette er totalen») (GOV.UK).
- **A control says exactly what happens.** «Åpne på GitHub», «Se alle 14», «Bruk min posisjon». Never «Klikk her», «Mer», «OK».
- **Links say what they open and where.** A link out names the place; a back link names the list («Pull requests»), never «Tilbake».
- **Active voice,** plain words, the way a knowledgeable person would say it.
- **Klarspråk:** say who does what, with «du» and «vi» («Du får et varsel når episoden er lastet ned», not «Det sendes et varsel»); put
  the verb early; write the verb, not a noun made of it («Vi har oppdatert listen», not «Det er foretatt en oppdatering av listen»;
  watch for «-ing» and «-else» with «av»). One idea a sentence. No stock phrases («herved», «vennligst», «i henhold til»), no scare quotes.
- **Never point by look or place alone:** not «den grønne knappen», «menyen til venstre», «trykk på hjertet»; name the thing by its words.
  A screen reader, a small screen and forced colours do not share the look.
- **One voice, many tones.** Every app in the family speaks the same way: plain bokmål, «du», short sentences, no exclamation marks, dry
  humour at most and never in an error. The tone moves with the moment (a welcome is warmer than an error); clear beats entertaining, and
  forced humour is worse than none (Mailchimp). What a reader sees often is shortest and plainest (Atlassian). The app's name is written
  the same everywhere: `<title>`, manifest, `Wordmark`, first run. No slogans. The app's own voice and examples are in its brand platform
  (**designsystem-brand**).

## States

| State | Write |
| --- | --- |
| Empty | Fixed words, by `EmptyState reason`: «Ingen {what} ennå» (`first-run` with the app's own line, `nothing-yet` with «De dukker opp her når det kommer noe.»), «Ingen treff for «{query}»» + «Sjekk stavemåten eller prøv et annet søk.» and «Tøm søket» (`no-results`), «Ingen {what}» + «Alt er behandlet.» (`all-done`). The app writes only `what` (a plural noun: «åpne pull requests», «episoder») and a first run's line: why it is empty and what to do next, in one or two sentences. |
| Error | Fixed words, by `ErrorMessage what`: «Kunne ikke hente {what}», then «Prøv igjen». The cause goes in its «Detaljer» fold («GitHub svarte 502»), never in the title. No «Vennligst», «Beklager», «Ups», «ugyldig» or «Noe gikk galt». In a form, use the same words in a summary and next to the field: what is wrong and how to fix it («Skriv brukernavnet slik det står på Last.fm»), never only «Feltet er påkrevd». Never blame the reader. |
| Stale or offline | «Oppdatert 19:27 · dataene kan være gamle», «Du er frakoblet. Det du ser er fra sist siden ble hentet.» Back online: nothing. |
| Source failed | «Henting fra Yr feilet. Viser vær fra 19:27.» with old data; «Kunne ikke hente værmeldingen fra Yr. Prøv igjen.» without. A retry says «Prøv igjen», and «Henter …» while it runs. |
| Not found | Say what was not found and give a way back. |
| Waiting | «Venter på review», «Tester kjører»: the state, not «Vennligst vent». A form being sent: the verb going on, «Lagrer …», «Sjekker brukernavnet …» (`PendingButton`). An ellipsis is one character (…) after a space. |
| Done | Say what happened, one word in the past tense and no full stop: «Lagret», «Slettet», «Kopiert» (`Banner tone="success"`). |
| Disabled | Avoid it. Say in words what is missing («Velg en episode først») and leave the control usable (Designsystemet, «Deaktiverte tilstander»). |

## Text that people wrote

A description or a comment written in Markdown is shown with `Markdown`, never as flat text and never as inserted HTML. Show enough to
decide, cut at a paragraph and not in the middle of a construct, and say where the rest is («Åpne på GitHub» last). A text in another
language keeps its language and is marked with `lang` (**designsystem-accessibility**); never machine-translate it silently.

## Text a machine wrote (KI)

- **Say it before the text, in words:** «Sammendrag laget av KI» (Språkrådet: «KI», not «AI»), with what it was made from («fra
  episodebeskrivelsen») and, where it can be wrong, «Kan inneholde feil». A symbol alone is not a label.
- Never in the voice of the person or the show («Vi snakker om …»); write about them in the third person. Plain text in `Text`, never
  Markdown, never the title or the description it summarises.
- The original stays one tap away, and a transcript a machine made says so the same way. The EU AI Act (art. 50, from August 2026)
  asks that people know when text is made by AI; we do it anyway.

## Counts, dates and numbers

- Counts are numbers: «Se alle 14», «2 åpne kommentarer», «1 åpen kommentar» (singular is a separate string; choose with
  `Intl.PluralRules`, never `n === 1` scattered in a page). Zero takes the plural («0 episoder»), but an empty list says «Ingen episoder».
- Format with `Intl` in **nb-NO** and **Europe/Oslo**: dates `18. nov.`, long `18. november 2026`, with a time `18. november 2026 kl. 19:27`,
  time `19:27`. Never a hand-written format, never a slash («18/11»); `2026-11-18` only in `datetime` and in data.
- A minus is **−** (U+2212), not a hyphen: `−3°` (`Intl` gives it). A range is «−2° / 4°». Figures that line up use `numeric` (tabular numbers). A decimal is a comma: «1,5 km».
- «i dag», «i går», «i morgen» are fine for the near (`Intl.RelativeTimeFormat` with `numeric: "auto"`); a date for anything older than a few days. Say how old where age matters («Venter 3 dager»). A relative time («for 3 timer siden») always has the exact time with it: use `Time` (relative under seven days, a date after, the exact time in `title` and `datetime`).
- Units are written the Norwegian way: `mm`, `m/s`, `°`, `km`, `min`, `s`, without a period, and money as «kr» after the number with no øre for whole kroner («500 000 kr»; `Intl` adds «,00» unless told `maximumFractionDigits: 0`). Thousands are grouped in threes with a space (`Intl` gives a non-breaking one, also in four digits: «2 500»), never a comma or a period, and a number and its unit or `%` stay together with a non-breaking space («93 %», «1,5 km»: `Intl` leaves a plain space before a unit, so glue it).
- A time is `19:27` and in a sentence «kl. 19:27» (what `Intl` gives in nb-NO; Språkrådet allows a colon or a period, Skatteetaten writes a colon, Aksel writes «kl. 14.00», so we follow `Intl` and keep it). A range is an en dash without spaces («9–15», «kl. 08:00–15:30», «2020–2025», «mandag–fredag»), or «fra 08:00 til 15:30»; never «fra 08:00–15:30» (Språkrådet: «fra» needs «til») and never a spaced hyphen. Avoid «24:00»: say «ved midnatt».
- A duration is «1 t 2 min» short and «1 time og 2 minutter» long (`Intl.DurationFormat`); a media position is «12:05» or «1:02:05» (Aksel).
- Small numbers in running text are words up to twelve and digits above, the same way within a sentence; **counts and figures that are the point stay digits** («2 åpne kommentarer», «Se alle 14»). Phone numbers in pairs: «22 22 22 22».

## Status words

A status is a short word with a symbol, sentence case, never truncated and never colour alone (`Badge`, `StatusLine`). Colour only for what stops something. Keep one word for one meaning across the page: «Blokkert» (something stops it and it is for you to fix), «Klar til merge»,
«Venter på din review», «Venter på andre», «Utkast», «Stille i 3 dager». Do not invent a second word for the same state.

## Wording buttons, links and titles

- **Verbs for actions, not noun phrases:** «Åpne på GitHub», not «Åpning av GitHub»; «Lagre», not «Lagring». One or two words where
  the context is clear, the object added where it is not («Slett nedlastingen»).
- **One word for one action across the apps** (Designsystemet, «Vanlige begreper»): «Slett» (never «Fjern» for the same thing),
  «Endre» (not «Rediger»), «Lukk», «Vis» and «Skjul», «Neste» and «Forrige», «Avbryt» to leave without saving.
- **A link says where it goes.** Never «Les mer», «Mer info» or «Klikk her». A file gets its type in parentheses: «Årsrapport (pdf)».
- Write **«du»** to the reader. Sentence case in titles and labels; a list item that is a full sentence takes a capital and a full stop, a fragment neither.
- **Punctuation in microcopy** (Designsystemet): no full stop in a title, a label, a button or a `Disclosure` summary; a label never ends
  in a colon, and a label that is a question ends in «?»; a hint, a description and a message are sentences with a full stop. No «!».
- **The page title** (`<title>`) is the page's `<h1>`, then the app: «Hades II – Medier», «Episoder – Podkast»; the front page is the
  app's name alone. After a failed submit it begins «Feil: ».
- Explain **why** a question is asked when it is not obvious, and say what happens next.
- A copy button says «Kopier» and then «Kopiert».

## Words for the ear: names, labels and alt text

- **The accessible name is Norwegian and says what happens**, verb first and the object after: «Spill av», «Slett nedlastingen av
  {episode}», «Lukk». Never the role («knapp», «lenke») or the look («ikon», «pil»): the screen reader says the role itself.
- **A visible word starts the name** (WCAG 2.5.3): a button that shows «Endre» has «Endre brukernavn», not «Oppdater navnet». Context a
  sighted reader gets from the row goes in hidden text after the visible word.
- **Repeated links in rows** are the row's own name; where a short verb repeats («Endre», «Slett»), each gets its object in hidden text.
- **Alt text says what the picture is for here**, in one short sentence without «Bilde av»: an episode's artwork beside its title is `alt=""`;
  a picture that is the link says where it goes; a picture with information says it («Kart over Oslo med regn fra vest»). A text in a
  picture is written out.
- Abbreviations a voice reads wrongly are written out where they are the point; an English word inside a Norwegian name is fine.

## Notifications

- **One notification for one thing**, never repeated for the same thing (Apple HIG). It says what happened: a title with the thing
  («Ny episode av Lørdagsrådet»), a body that is one full sentence, sentence case, no app name (the system shows it), no «Klikk her».
- **Nothing private on a lock screen:** no names of people or what they listen to where the reader has not asked for it; the text must
  make sense when previews are hidden.
- An error is never a notification; it is on the page (`ErrorMessage`). Asking for permission says first, in the page, what will come
  and how often (`PermissionCard`).

## Inclusive language

- Describe people as they describe themselves, and only when it matters: «personer med nedsatt syn», «rullestolbruker»; never
  «handikappet», «lider av», «normal».
- No ability metaphors in the interface («blind for», «lam», «døv for»), no gendered defaults («han» for the reader): rewrite to «du»,
  the plural or the role. Example names and pictures vary.
- No idioms or wordplay that a reader with Norwegian as a second language or a translation tool will misread.

## Headings and labels

- Section titles are nouns; a group's title says what is in it («Krever deg», «Issues til deg»).
- An `iconLabel` names the kind in one word («Pull request», «Issue», «Spørsmål»).
- Section titles and labels are short noun phrases in sentence case; nothing is set in capitals.

## Sources

[Språkrådet, tall, tid og dato](https://sprakradet.no/godt-og-korrekt-sprak/rettskriving-og-grammatikk/tall-tid-dato/) ·
[Designsystemet, tegnsetting i mikrotekster](https://designsystemet.no/no/best-practices/content-work/microtexts) ·
[Designsystemet, vanlige begreper](https://designsystemet.no/no/best-practices/content-work/terms) ·
[Aksel, skriveregler i Nav](https://aksel.nav.no/god-praksis/artikler/skriveregler-i-nav) ·
[Skatteetaten, skriveregler](https://www.skatteetaten.no) ·
[GOV.UK, writing for user interfaces](https://www.gov.uk/service-manual/design/writing-for-user-interfaces) ·
[Apple HIG, notifications](https://developer.apple.com/design/human-interface-guidelines/notifications) ·
[EU AI Act, article 50](https://artificialintelligenceact.eu/article/50/)

Before finishing, run **designsystem-review**.
