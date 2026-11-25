/**
 * The address to ask for a picture again when it failed as a CORS request: the same picture under an address of its own. An image CDN that sends
 * `Access-Control-Allow-Origin` only when asked with an `Origin`, and does not say `Vary: Origin` (TMDB's), leaves the browser a copy without it from the page's
 * plain `<img>`, and a CORS request for the same address is then refused from that copy (Safari always does). Pure, so a test pins it.
 */
export function corsRetryUrl(src: string): string {
  const hash = src.indexOf("#")
  const [base, fragment] = hash === -1 ? [src, ""] : [src.slice(0, hash), src.slice(hash)]
  return `${base}${base.includes("?") ? "&" : "?"}cors=1${fragment}`
}

/**
 * Loads a picture for drawing into a canvas or WebGL (so as a CORS request), and calls `onLoad` with it. When the request is refused (see `corsRetryUrl`), asks
 * once more under an address of its own. Returns the function that stops it.
 */
export function loadCorsImage(src: string, onLoad: (image: HTMLImageElement) => void): () => void {
  let stopped = false
  const image = new Image()
  image.crossOrigin = "anonymous"
  let retried = false
  image.addEventListener("load", () => {
    if (!stopped) onLoad(image)
  })
  image.addEventListener("error", () => {
    if (stopped || retried || src.startsWith("data:") || src.startsWith("blob:")) return
    retried = true
    image.src = corsRetryUrl(src)
  })
  image.src = src
  return () => {
    stopped = true
  }
}
