// `/presentasjoner/<slug>/<file>.pdf`: a talk's PDF from the bucket, as a download (`src/lib/download.ts`).
import { bucketRoutes } from '../../lib/download'

export const prerender = false

export const { GET, HEAD } = bucketRoutes('pdf')
