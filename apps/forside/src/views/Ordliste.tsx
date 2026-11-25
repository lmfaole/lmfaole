// `/ordliste`: the names that come up in the texts, each a link to where it belongs, in alphabetical order.
import { List } from '@lmfaole/designsystem/components/list'
import { PageHeader } from '@lmfaole/designsystem/components/page-header'

import type { GlossaryTerm } from '../lib/stored'

export function Ordliste({ title, description, terms }: { title: string; description: string; terms: readonly GlossaryTerm[] }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <List
        label={title}
        columns={{ name: 'Navn' }}
        rows={terms.map((term) => ({ key: term.id, title: term.term, href: term.url, external: true, meta: [term.host] }))}
      />
    </>
  )
}
