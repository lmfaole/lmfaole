/**
 * The Worker's end of `stored.ts`: the CV from the D1 database `site` (the binding `SITE`), or, while it has none (the import has not run, the migration is not applied)
 * or cannot answer, the checked-in snapshot `src/data/cv.json`, so the page looks as it did before there was a database. Only ever reads.
 */

import { env } from 'cloudflare:workers'

import { readOr } from '@lmfaole/web/d1'

import snapshot from '../data/cv.json'
import type { Cv } from './cv'
import { storedCv } from './stored'

export const currentCv = async (): Promise<Cv> => (await readOr(env['SITE'], 'site: the CV', storedCv, null)) ?? snapshot
