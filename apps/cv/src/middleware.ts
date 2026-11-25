import { pageCache, secured } from '@lmfaole/web/middleware'
import { cacheablePaths } from '@lmfaole/web/page-cache'

const base = import.meta.env.BASE_URL

/**
 * Every answer of the Worker (the CV, its JSON, the 404) gets the security headers; a built file has them from `public/_headers`. The CV and its JSON
 * (read from D1) are kept at the edge for a few minutes; anything else is drawn anew. The CV reads no query, so one copy serves every address of it.
 */
export const onRequest = secured(pageCache({ cacheable: cacheablePaths([base, `${base}api/cv.json`]) }))
