// The front page, as little as it can be: the name and role, one sentence, and a few plain links.
import { Inline } from '@lmfaole/designsystem/components/layout'
import { PageHeader } from '@lmfaole/designsystem/components/page-header'
import { Text, TextLink } from '@lmfaole/designsystem/components/text'

import { BIO, type Owner, PROFILE } from '../lib/profile'

export function Forside({ owner }: { owner: Owner }) {
  return (
    <>
      <PageHeader title={owner.name} description={owner.role} />
      <Text>{BIO}</Text>
      <Inline
        label="Lenker"
        items={[
          <TextLink href={PROFILE.cv}>CV</TextLink>,
          <TextLink href={PROFILE.github} external>GitHub</TextLink>,
          <TextLink href={PROFILE.linkedin} external>LinkedIn</TextLink>,
          <TextLink href={`mailto:${PROFILE.email}`}>E-post</TextLink>,
        ]}
      />
    </>
  )
}
