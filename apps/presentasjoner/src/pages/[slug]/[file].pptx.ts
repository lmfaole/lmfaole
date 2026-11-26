// `/presentasjoner/<slug>/<file>.pptx`: a talk's PowerPoint from the bucket, as a download (`src/lib/download.ts`). What is in the bucket
// is the generic deck built from the design system's own template, never the one made in the employer's.
import { bucketRoutes } from '../../lib/download'

export const prerender = false

export const { GET, HEAD } = bucketRoutes('pptx')
