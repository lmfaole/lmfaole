import { secured } from '@lmfaole/web/middleware'

/** Every answer of the Worker (a PDF, the 404) gets the security headers; a built page has them from `public/_headers`. */
export const onRequest = secured((_context, next) => next())
