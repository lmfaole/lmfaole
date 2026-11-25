import type { ReactNode } from "react";

import { shapeOf, type PictureKind } from "../lib/picture-kinds";
import { fallbackOf, srcSetOf, type PictureSource } from "../lib/picture-sources";
import { presenceWords, type Presence } from "../lib/games";
import { ENTITY_LINK } from "../lib/link-style";
import { LiveDot } from "./live-dot";
import { Time } from "./time";
import { GAME_CASES, type GameCase } from "../lib/sleeve-shader";
import { episodeNumberWords, episodeTypeWord, type EpisodeNumber } from "../lib/episode-number";
import { AlbumSleeve } from "./album-sleeve";
import { Badge } from "./badge";
import { EpisodeMark } from "./internal/episode-mark";
import { PictureFrame } from "./internal/picture-frame";
import { Stage } from "./stage";
import { FigureList as Figures, type KeyFigure } from "./key-figures";
import { Heading } from "./text";

/** One of the few numbers that say most about the thing (`KeyFigure`). */
export type DetailFigure = KeyFigure;

export type { Presence } from "../lib/games";

/** A wide picture of the thing's world across the top of the head (a game's hero art): the address, or the widths its source offers. */
export interface DetailBackdrop {
  src?: string | null;
  sources?: readonly PictureSource[];
}

/** The hero art across the top of the head, edge to edge, fading into the stage: decoration only, nothing is written on it. */
function Backdrop({ backdrop }: { backdrop: DetailBackdrop }) {
  const set = srcSetOf(backdrop.sources, 1200);
  const shown = backdrop.src ?? (backdrop.sources === undefined ? undefined : fallbackOf(backdrop.sources, 1200)?.src);
  if (shown === undefined || shown === null || shown === "") return null;
  return (
    <div aria-hidden="true" className="-mx-5 -mt-5 mb-4 h-[clamp(6rem,26cqi,16rem)] overflow-hidden bg-muted [mask-image:linear-gradient(to_bottom,black_55%,transparent)] @3xl:-mx-8 @3xl:-mt-8 @3xl:mb-6">
      <img src={shown} {...(set === null ? {} : { srcSet: set.srcSet, sizes: "100vw" })} alt="" loading="lazy" decoding="async" width={1920} height={620} className="size-full object-cover" />
    </div>
  );
}

/** Where the person is now, under the name: a live dot and «Spiller Hades II» (the game a link to its page), or «Borte», «Frakoblet · sist på nett …». */
function PresenceLine({ presence }: { presence: Presence }) {
  const { words, live } = presenceWords(presence);
  return (
    <p className="inline-flex min-w-0 items-center gap-2 text-sm font-medium [overflow-wrap:anywhere]">
      {live ? <LiveDot /> : <span aria-hidden="true" className="inline-block size-2 shrink-0 rounded-full border border-foreground" />}
      <span className="min-w-0">
        {presence.state === "in-game" && presence.href !== undefined ? (
          <>
            Spiller{" "}
            <a href={presence.href} className={ENTITY_LINK}>
              {presence.game}
            </a>
          </>
        ) : (
          words
        )}
        {presence.state !== "in-game" && presence.lastOnline !== undefined ? (
          <>
            {" · sist på nett "}
            <Time value={presence.lastOnline.at} now={new Date(presence.lastOnline.now)} />
          </>
        ) : null}
      </span>
    </p>
  );
}

const isGameCase = (disc: string): disc is GameCase => GAME_CASES.some((one) => one === disc);

/**
 * The head of a page of a thing (an artist, an album, a film, a person): its main picture and its name together, on a stage whose ground is the picture's own colours drawn in WebGL, moving with the page's light.
 * It is the page's `<h1>`, so the page leaves out its own title. On a phone the picture stands beside the name and not above it, so neither is alone; the picture is the lit main picture
 * (`Picture size="hero"`, lit on its frame), and nothing is painted over it. What belongs to the head goes in `children`, under the name: by whom, an attribution. Text in the head is the full text colour, never `muted`: the ground is tinted, and muted text would fall under 4.5:1.
 * `kind` is what the thing is (`PictureKind`), and the picture takes that kind's shape, as everywhere else; `label` says it in words above the name.
 * `episode` is an episode's place in its podcast: «S2 E14» after the label, and «Trailer» or «Bonus» beside it.
 * `backdrop` is a wide picture of the thing's world across the top of the head (a game's hero art), edge to edge and faded into the stage; it is decoration, and nothing is written on it. `presence` is where a person is now (a Steam profile), on a line under the name.
 * `figures` are the two or three numbers that say most about the thing, large, under the name; each is said here and not again on the page.
 * The head is large where the picture is the page's face: an artist's portrait, and a page with a `sleeve` (`Picture size="feature"`): in a narrow head (under 36rem of its own room: a phone, a tablet beside the menu) the name goes first, the width of the head, and the picture under it, half the head wide, beside the figures; from 36rem
 * the picture is beside the name, at 14rem growing to 20rem, with the name, the figures and `children` in a column centred on it. With `sleeve` (an album's page) the sleeve takes the picture's place, its cover as large
 * as a portrait would be and the record beside it: in a narrow head it is the whole width, under the name, and the figures go across under it. A film's page with `sleeve` has its poster in a DVD case the same way,
 * and an album whose edition is a CD has `disc="cd"`: its cover in a jewel case with the CD beside it. A poster's `disc="cartridge"` is a handheld game's case with its game card beside it in place of the DVD,
 * and an old console's game has its own (`nes`, `snes`, `n64`, `gameboy`, `gba`: a cardboard box with that console's cartridge; `genesis`: a black clamshell with a black cartridge; `psx`: a jewel case with a black disc).
 */
export function DetailHeader({
  kind,
  label,
  title,
  picture,
  sources,
  sleeve = false,
  disc = "record",
  figures = [],
  episode,
  backdrop,
  presence,
  children,
}: {
  /** What kind of thing it is: its picture takes that kind's shape (`PictureKind`). */ kind: PictureKind;
  /** What it is, in words above the name: «Artist», «Album», «Film · 1995», «Din nest mest spilte artist». */ label: string;
  /** Its name: the page's `<h1>`. */ title: string;
  picture?: string | null;
  sources?: readonly PictureSource[];
  /** An album (a square kind): its cover as a sleeve in 3D with a record pulled half out (`AlbumSleeve`), under the light. A film or a game (a poster kind): its poster in a DVD case with the disc half out. For a picture the app may alter (Last.fm's, TMDB's), never Spotify's. */ sleeve?: boolean;
  /** What the `sleeve` holds. A square's: `record` (a sleeve with a record), or `cd` (a jewel case with a CD, for an album whose edition is a CD). A poster's is a DVD, or a game's case with what it holds: `cartridge` (a handheld's game card), or an old console's (`nes`, `snes`, `n64`, `gameboy`, `gba`, `genesis`, `psx`). */ disc?: "record" | "cd" | GameCase;
  /** Two or three numbers that say most about the thing, large under the name (`DetailFigure`). */ figures?: readonly DetailFigure[];
  /** An episode's place in its podcast: «S2 E14» after `label`, and «Trailer» or «Bonus» beside it. */ episode?: EpisodeNumber;
  /** A wide picture of the thing's world across the top of the head, edge to edge (a game's hero art, Steam's `library_hero`): decoration, faded into the stage, with nothing on it. */ backdrop?: DetailBackdrop;
  /** Where a person is now, under the name (a Steam profile): «Spiller Hades II» with a live dot, «På nett», «Borte», «Frakoblet» (`presenceOf`). */ presence?: Presence;
  children?: ReactNode;
}) {
  const typeWord = episode === undefined ? null : episodeTypeWord(episode.type);
  const name = (
    <>
      <p className="min-w-0 text-sm font-medium [overflow-wrap:anywhere]">
        {label}
        {episode === undefined || episodeNumberWords(episode) === null ? null : (
          <>
            {" · "}
            <EpisodeMark episode={episode} />
          </>
        )}
        {typeWord === null ? null : (
          <span className="ms-2 inline-block align-middle">
            <Badge>{typeWord}</Badge>
          </span>
        )}
      </p>
      <Heading level={1}>{title}</Heading>
      {presence === undefined ? null : <PresenceLine presence={presence} />}
    </>
  );
  const own = sources === undefined ? {} : { sources };
  const { ratio, corners } = shapeOf(kind, "hero");
  const ratioOf = ratio === "poster" ? "poster" : "square";
  // A poster's sleeve is a DVD case (or a game card's), a square's a record's (or a CD's).
  const held = ratio === "poster" ? (isGameCase(disc) ? disc : "dvd") : disc === "cd" ? "cd" : "record";
  if (sleeve || kind === "artist") {
    const beside = figures.length > 0;
    const record = sleeve;
    // A sleeve is half as wide again as its cover, so its column is too; in a narrow head it has the width and the figures go under it.
    const columns = record
      ? `grid-cols-1 [grid-template-areas:'name'_'picture'_'figures'_'more'] @xl:grid-cols-[20.5rem_minmax(0,1fr)] @3xl:grid-cols-[23.5rem_minmax(0,1fr)] @5xl:grid-cols-[29rem_minmax(0,1fr)]`
      : `@xl:grid-cols-[14rem_minmax(0,1fr)] @3xl:grid-cols-[16rem_minmax(0,1fr)] @5xl:grid-cols-[20rem_minmax(0,1fr)] ${beside ? "grid-cols-[minmax(0,11fr)_minmax(0,9fr)] [grid-template-areas:'name_name'_'picture_figures'_'more_more']" : "grid-cols-[minmax(0,3fr)_minmax(0,2fr)] [grid-template-areas:'name_name'_'picture_.'_'more_more']"}`;
    return (
      <Stage as="header" picture={picture ?? null} {...own}>
        {backdrop === undefined ? null : <Backdrop backdrop={backdrop} />}
        {/* Its own container: the layout follows the room the head has, not the page's. */}
        <div className="@container">
          <div
            className={`grid gap-x-4 gap-y-4 [overflow-wrap:anywhere] @xl:grid-rows-[1fr_auto_auto_auto_1fr] @xl:gap-x-8 @xl:gap-y-4 @xl:[grid-template-areas:'picture_.'_'picture_name'_'picture_figures'_'picture_more'_'picture_.'] ${columns}`}
          >
            <div className="grid min-w-0 gap-1 [grid-area:name]">{name}</div>
            <div className="min-w-0 [grid-area:picture]">
              {record ? (
                <AlbumSleeve src={picture ?? null} {...own} size="feature" kind={held} />
              ) : (
                <PictureFrame
                  src={picture ?? null}
                  {...own}
                  ratio={ratioOf}
                  corners={corners}
                  size="feature"
                  priority
                />
              )}
            </div>
            {beside ? (
              <div className="min-w-0 self-center [grid-area:figures]">
                <Figures figures={figures} across={record} />
              </div>
            ) : null}
            {children === undefined || children === null ? null : (
              <div className="grid min-w-0 gap-2 [grid-area:more]">
                {children}
              </div>
            )}
          </div>
        </div>
      </Stage>
    );
  }
  return (
    <Stage as="header" picture={picture ?? null} {...own}>
      {backdrop === undefined ? null : <Backdrop backdrop={backdrop} />}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 @3xl:gap-x-8">
        {sleeve ? (
          <AlbumSleeve src={picture ?? null} {...own} kind={held} />
        ) : (
          <PictureFrame
            src={picture ?? null}
            {...own}
            ratio={ratioOf}
            corners={corners}
            size="hero"
            priority
          />
        )}
        <div className="grid min-w-0 gap-1 [overflow-wrap:anywhere]">
          {name}
          {figures.length === 0 ? null : (
            <div className="py-2">
              <Figures figures={figures} across />
            </div>
          )}
          {children}
        </div>
      </div>
    </Stage>
  );
}
