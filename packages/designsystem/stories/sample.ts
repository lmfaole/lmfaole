/** Made-up pictures for the stories: SVG data URIs, so nothing is fetched and no project's artwork is needed. */
function svg(width: number, height: number, hue: number, label: string): string {
  const body = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="hsl(${hue} 45% 45%)"/><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="${Math.round(width / 5)}" text-anchor="middle" dominant-baseline="central">${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(body)}`
}

export const poster = (hue: number, label = "A"): string => svg(200, 300, hue, label)
export const square = (hue: number, label = "A"): string => svg(200, 200, hue, label)
export const wide = (hue: number, label = "A"): string => svg(460, 215, hue, label)
/** A game's hero art (Steam's `library_hero`, about 3:1) and a screenshot (16:9). */
export const banner = (hue: number, label = "A"): string => svg(1920, 620, hue, label)
export const screenshot = (hue: number, label = "A"): string => svg(1280, 720, hue, label)
/** A picture of another shape: an old console's box, a GBA's square, an SNES's lying down. */
export const boxArt = (width: number, height: number, hue: number, label = "A"): string => svg(width, height, hue, label)

/** Twelve months of made-up counts, for the charts. */
export const MONTHS = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"].map((label, index) => ({
  label,
  value: [12, 18, 9, 24, 31, 27, 15, 22, 38, 33, 19, 26][index] ?? 0,
}))

/** A made-up album cover with a gradient and a disc of colour on it, so a sleeve in 3D has something to catch the light on. */
export function albumCover(from: string, middle: string, to: string, spot: string): string {
  const body = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset=".55" stop-color="${middle}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="300" height="300" fill="url(#g)"/><circle cx="190" cy="105" r="58" fill="${spot}"/><rect x="28" y="230" width="150" height="14" fill="white" opacity=".85"/><rect x="28" y="252" width="96" height="9" fill="white" opacity=".6"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(body)}`
}

/** A made-up map tile: a pale ground, a park and a few streets that run on across the tiles, so a map in a story needs no network. */
export function mapTile(z: number, x: number, y: number): string {
  const park = (x * 7 + y * 3) % 4 === 0 ? `<rect x="40" y="150" width="90" height="70" fill="#c8e6c0"/>` : ""
  const water = (x + y * 2) % 5 === 1 ? `<path d="M0 210 Q128 180 256 220 V256 H0Z" fill="#aad3df"/>` : ""
  const body = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#f2efe9"/>${park}${water}<g stroke="#fff" stroke-width="10"><path d="M0 64 H256 M0 192 H256 M64 0 V256 M192 0 V256"/></g><g stroke="#f7d18a" stroke-width="7"><path d="M0 ${96 + ((x * 13) % 40)} L256 ${96 + (((x + 1) * 13) % 40)}"/></g><text x="8" y="20" font-family="sans-serif" font-size="11" fill="#999">${z}/${x}/${y}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(body)}`
}

let silence: string | undefined
/**
 * A podcast episode's audio for the stories: an hour and two minutes of silence (3725 s, as long as `episode`), made in the browser as a WAV
 * (8-bit mono at 3000 Hz, the lowest Chromium takes), so nothing is fetched and the length the audio gives is the length the story shows.
 */
export function podcastAudio(): string {
  if (silence !== undefined) return silence
  const seconds = 3725
  const rate = 3000
  const samples = seconds * rate
  const header = new DataView(new ArrayBuffer(44))
  const text = (at: number, value: string) => {
    for (const [index, letter] of [...value].entries()) header.setUint8(at + index, letter.codePointAt(0) ?? 0)
  }
  text(0, "RIFF")
  header.setUint32(4, 36 + samples, true)
  text(8, "WAVE")
  text(12, "fmt ")
  header.setUint32(16, 16, true)
  header.setUint16(20, 1, true)
  header.setUint16(22, 1, true)
  header.setUint32(24, rate, true)
  header.setUint32(28, rate, true)
  header.setUint16(32, 1, true)
  header.setUint16(34, 8, true)
  text(36, "data")
  header.setUint32(40, samples, true)
  silence = URL.createObjectURL(new Blob([header.buffer, new Uint8Array(samples).fill(128)], { type: "audio/wav" }))
  return silence
}

/** A made-up episode with five chapters, for the podcast stories. Its audio is `podcastAudio()`, silent. */
export function episode(overrides: Partial<{ id: string; title: string; show: string; src: string; picture: string; href: string; duration: number; chapters: { start: number; title: string; href?: string }[] }> = {}) {
  return {
    id: "ep-42",
    title: "Episode 42: Lyden av byen",
    show: "Byvandring",
    src: podcastAudio(),
    picture: square(260, "B"),
    duration: 3725,
    chapters: [
      { start: 0, title: "Intro" },
      { start: 180, title: "Ukas nyheter" },
      { start: 600, title: "Intervjuet" },
      { start: 2400, title: "Lytterspørsmål", href: "https://example.com/sporsmal" },
      { start: 3300, title: "Takk for nå" },
    ],
    ...overrides,
  }
}
