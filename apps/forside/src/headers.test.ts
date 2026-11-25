import { testHeadersFile } from '@lmfaole/web/testing'

testHeadersFile(new URL('../public/_headers', import.meta.url), '/*')
