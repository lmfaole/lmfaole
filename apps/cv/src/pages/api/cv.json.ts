// `/cv/api/cv.json`: the CV as data, the same the page is drawn from (D1, or the snapshot while it has none).
import type { APIRoute } from 'astro'

import { currentCv } from '../../lib/runtime'

export const GET: APIRoute = async () => Response.json(await currentCv())
