import type { MetadataRoute } from "next"

// Paths are written out with the base path: the manifest is read as it is, not through Next's router.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/start",
    name: "Startside",
    short_name: "Start",
    description: "Det jeg skal gjøre og se på i løpet av arbeidsdagen.",
    lang: "nb",
    start_url: "/start",
    scope: "/start",
    display: "standalone",
    // The bars are the brand, teal (--brand in light); the splash screen is the design system's dark background, so the teal icon
    // stands out on it, as in Medier. The tab colour in the browser follows the phone, light or dark (viewport.themeColor in layout.tsx).
    background_color: "#0a0a0a",
    theme_color: "#087c77",
    categories: ["productivity"],
    icons: [
      { src: "/start/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/start/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/start/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
