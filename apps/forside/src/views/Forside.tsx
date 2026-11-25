// The front page, as little as it can be: the name and role, one sentence, a few plain links, and, once the catalog has run, what the owner did on GitHub lately.
import { KeyFigures, type KeyFigure } from '@lmfaole/designsystem/components/key-figures'
import { Inline } from '@lmfaole/designsystem/components/layout'
import { List } from '@lmfaole/designsystem/components/list'
import { PageHeader } from '@lmfaole/designsystem/components/page-header'
import { PageSection } from '@lmfaole/designsystem/components/page-section'
import { Text, TextLink } from '@lmfaole/designsystem/components/text'
import { Time } from '@lmfaole/designsystem/components/time'

import { BIO, PROFILE } from '../lib/profile'
import type { FrontPage, GithubActivity } from '../lib/stored'

const count = new Intl.NumberFormat('nb-NO')
const plural = new Intl.PluralRules('nb-NO')

/** The year's counts, the ones there are. */
function figures(github: GithubActivity): KeyFigure[] {
  return [
    github.contributions > 0 ? { value: count.format(github.contributions), label: 'bidrag det siste året' } : null,
    github.merged > 0
      ? { value: count.format(github.merged), label: plural.select(github.merged) === 'one' ? 'pull request flettet det siste året' : 'pull requests flettet det siste året' }
      : null,
  ].filter((figure) => figure !== null)
}

/** The year on GitHub in numbers, and the latest pull requests that were merged, each a link to GitHub. */
function Github({ github, now }: { github: GithubActivity; now: Date }) {
  return (
    <PageSection id="github" title="GitHub" icon="code">
      <KeyFigures figures={figures(github)} />
      {github.latest.length === 0 ? null : (
        <List
          label="Siste flettede pull requests"
          columns={{ name: 'Tittel' }}
          rows={github.latest.map((pull) => ({
            key: pull.key,
            icon: 'merge',
            iconLabel: 'Pull request',
            title: pull.title,
            href: pull.href,
            external: true,
            meta: [pull.repo, <Time key="merged" value={pull.mergedAt} now={now} />],
          }))}
        />
      )}
    </PageSection>
  )
}

export function Forside({ page, now }: { page: FrontPage; now: Date }) {
  const intro = (
    <>
      <Text>{BIO}</Text>
      <Inline
        label="Lenker"
        items={[
          <TextLink href={PROFILE.cv}>CV</TextLink>,
          <TextLink href={PROFILE.presentations}>Presentasjoner</TextLink>,
          <TextLink href={PROFILE.github} external>GitHub</TextLink>,
          <TextLink href={PROFILE.linkedin} external>LinkedIn</TextLink>,
          <TextLink href={`mailto:${PROFILE.email}`}>E-post</TextLink>,
          ...(page.glossary ? [<TextLink href={PROFILE.glossary}>Ordliste</TextLink>] : []),
        ]}
      />
    </>
  )
  return (
    <>
      <PageHeader title={page.owner.name} description={page.owner.role} />
      {page.github === null ? (
        intro
      ) : (
        <>
          {/* A part of the page (`data-page-part`, the design system's `SECTION_RHYTHM`), so `PageLayout` leaves the room between it and the section after it. */}
          <div data-page-part="">{intro}</div>
          <Github github={page.github} now={now} />
        </>
      )}
    </>
  )
}
