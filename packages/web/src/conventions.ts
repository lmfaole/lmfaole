/**
 * What every app's Worker is (and what `npm run new-app` writes): a path of lmfaole.party and nothing else. The conventions live with every other
 * Worker's in `@lmfaole/worker/conventions` (an app is a Worker too); this is the apps' way in, so nothing that imports them from here changes.
 */

export { allowedRoutes, COMPATIBILITY_DATE, parseJsonc, wranglerProblems, ZONE } from '@lmfaole/worker/conventions'
