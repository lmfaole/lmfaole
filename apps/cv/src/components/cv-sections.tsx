// The CV's parts, newest first. A description is the owner's own text, in Norwegian as written.
import { Stack } from '@lmfaole/designsystem/components/layout'
import { List, type ListRow } from '@lmfaole/designsystem/components/list'
import { PageSection } from '@lmfaole/designsystem/components/page-section'
import { Heading, Text } from '@lmfaole/designsystem/components/text'

import { formatDate, type Cv, type Project, type Role } from '../lib/cv'
import { periodLabel } from '../lib/period'

/** A project as a row: its name (a link where it has an address), the period, what it is, and its latest commit on GitHub. */
function projectRow(project: Project): ListRow {
  const title = project.tittel ?? project.navn
  return {
    key: `${project.fra}-${title}`,
    title,
    ...(project.url === null ? {} : { href: project.url, external: true }),
    meta: [
      periodLabel(project.fra, project.til, project.aar),
      project.beskrivelse,
      project.github === null ? null : { label: `Siste commit i ${project.github.repo}: ${project.github.commit.message}`, href: project.github.commit.url, external: true },
      project.github === null ? null : formatDate(project.github.commit.at),
    ],
  }
}

function RoleEntry({ role, employer }: { role: Role; employer: string }) {
  return (
    <Stack gap="tight">
      <Text>{role.tittel}</Text>
      <Text role="quiet">{periodLabel(role.fra, role.til, role.aar)}</Text>
      {role.beskrivelse === null ? null : <Text>{role.beskrivelse}</Text>}
      <List rows={role.projects.map(projectRow)} label={`Prosjekter som ${role.tittel} hos ${employer}`} />
    </Stack>
  )
}

/** The CV's sections, one under the other: the experience, then the education. */
export function CvSections({ cv }: { cv: Cv }) {
  return (
    <>
      <PageSection id="erfaring" title="Erfaring" icon="computer">
        {cv.employers.map((employer) => (
          <Stack key={employer.navn}>
            <Stack gap="tight">
              <Heading level={3} look="section">{employer.navn}</Heading>
              {employer.sted === null ? null : <Text role="quiet">{employer.sted}</Text>}
            </Stack>
            {employer.roles.map((role) => (
              <RoleEntry key={`${role.fra}-${role.tittel}`} role={role} employer={employer.navn} />
            ))}
          </Stack>
        ))}
      </PageSection>
      <PageSection id="utdanning" title="Utdanning" icon="book">
        {cv.education.map((education) => (
          <Stack key={`${education.fra}-${education.grad}`} gap="tight">
            <Heading level={3} look="section">{education.grad}</Heading>
            <Text role="quiet">{[education.institusjon, periodLabel(education.fra, education.til, education.aar)].filter((part) => part !== null).join(' · ')}</Text>
            {education.beskrivelse === null ? null : <Text>{education.beskrivelse}</Text>}
          </Stack>
        ))}
      </PageSection>
    </>
  )
}
