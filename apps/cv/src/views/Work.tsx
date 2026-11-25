// The whole page: who (the facts in the rail, with the links out), then experience (with the projects and their latest commit) and education.
// Props only, rendered to HTML on the server: nothing on the page needs a script.
import { DetailLayout } from '@lmfaole/designsystem/components/detail-layout'
import { PageHeader } from '@lmfaole/designsystem/components/page-header'

import { CvSections } from '../components/cv-sections'
import type { Cv } from '../lib/cv'

export function Work({ cv }: { cv: Cv }) {
  const { person } = cv
  return (
    <>
      <PageHeader title={person?.navn ?? 'Ole Jørgen Bakken'} {...(person?.tittel == null ? {} : { description: person.tittel })} />
      <DetailLayout
        facts={[
          ['Arbeidsgiver', person?.arbeidsgiver],
          ['Sted', person?.sted],
        ]}
        links={cv.links.map((link) => ({ href: link.url, label: link.navn }))}
      >
        <CvSections cv={cv} />
      </DetailLayout>
    </>
  )
}
