# lmfaole.party

Kildekoden bak [lmfaole.party](https://lmfaole.party) - en enkel,
statisk forside med lenker til GitHub-profilen min og andre steder jeg
kan nås på nettet.

## Struktur

| Sti | Hva det er |
| --- | --- |
| `index.html` | Selve forsiden. Ingen build-steg, ingen JavaScript. |
| `styles.css` | Stilarket til forsiden. |
| `profilbilde.jpg` | Profilbilde hentet fra GitHub-avataren, brukt på siden og som og:image. |
| `favicon.ico` | Samme bilde i 16, 32 og 48 px - fanen i nettleseren. |
| `apple-touch-icon.png` | Samme bilde i 180 px - ikonet iOS legger på hjemskjermen. |
| `robots.txt` | Lar søkemotorer vite at hele siden kan indekseres. |
| `sitemap.xml` | Enkelt sitemap for søkemotorer. |

## Endre profilbildet

`profilbilde.jpg` er originalen; `favicon.ico` og `apple-touch-icon.png`
er avledet av den. Bytt ut originalen og generer på nytt med
ImageMagick:

```sh
magick profilbilde.jpg -strip -resize 16x16 -colors 32  /tmp/f16.png
magick profilbilde.jpg -strip -resize 32x32 -colors 64  /tmp/f32.png
magick profilbilde.jpg -strip -resize 48x48 -colors 128 /tmp/f48.png
magick /tmp/f48.png /tmp/f32.png /tmp/f16.png favicon.ico
magick profilbilde.jpg -strip -resize 180x180 -colors 256 apple-touch-icon.png
```

Fargene begrenses fordi et fotografi som 8-bits ICO ellers blir
uhandterlig stort.

## Utvikle lokalt

Ingen installasjon eller verktøy kreves - åpne `index.html` direkte i
en nettleser, eller server mappen med et vilkårlig statisk-fil-verktøy,
f.eks.:

```sh
npx serve .
```
