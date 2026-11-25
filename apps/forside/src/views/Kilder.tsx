// `/kilder`: where the media pages' content comes from and when each source is next fetched, from `lib/sources.ts`, as tables.
// The rhythm is in the HTML; the next time is worked out in the browser (`NextSync`), so this is an island.
import { PageSection } from '@lmfaole/designsystem/components/page-section'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lmfaole/designsystem/components/table'
import { TextLink } from '@lmfaole/designsystem/components/text'
import type { IconName } from '@lmfaole/designsystem/lib/icons'

import { nearest, nextText, useNow } from '../components/NextSync'
import { ACCOUNTS, APP_LABELS, KIND_LABELS, SOURCES, type AppId } from '../lib/sources'

const APP_ICONS: Record<AppId, IconName> = { music: 'music', film: 'film', tv: 'tv', games: 'game' }

/** Each app and when it next fetches, the soonest first once the clock is read. */
function NextSyncTable({ now }: { now: Date | null }) {
  const rows = SOURCES.map(({ app, sources }) => ({
    app,
    rhythm: sources.find((source) => source.schedule !== null)?.when ?? 'når en side vises',
    next: nearest(sources.flatMap((source) => (source.schedule === null ? [] : [source.schedule])), now),
  })).toSorted((a, b) => a.next.at - b.next.at)
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>App</TableHead>
          <TableHead>Hvor ofte</TableHead>
          <TableHead>Neste</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.app}>
            <TableCell>{APP_LABELS[row.app]}</TableCell>
            <TableCell>{row.rhythm}</TableCell>
            <TableCell>{row.next.text}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function Kilder() {
  const now = useNow()
  return (
    <>
      <PageSection id="neste" title="Neste henting" icon="time">
        <NextSyncTable now={now} />
      </PageSection>
      <PageSection id="kontoer" title="Kontoene mine" icon="person">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tjeneste</TableHead>
              <TableHead>Konto</TableHead>
              <TableHead>Brukes til</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ACCOUNTS.map((account) => (
              <TableRow key={account.service}>
                <TableCell>
                  <TextLink href={account.href} external>
                    {account.service}
                  </TextLink>
                </TableCell>
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.used}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageSection>
      {SOURCES.map(({ app, sources }) => (
        <PageSection key={app} id={`kilder-${app}`} title={APP_LABELS[app]} icon={APP_ICONS[app]}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kilde</TableHead>
                <TableHead>Hva</TableHead>
                <TableHead>Hentes</TableHead>
                <TableHead>Hvor ofte</TableHead>
                <TableHead>Neste</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.label}>
                  <TableCell>
                    <TextLink href={source.href} external>
                      {source.label}
                    </TextLink>
                  </TableCell>
                  <TableCell>{source.note}</TableCell>
                  <TableCell>{KIND_LABELS[source.kind]}</TableCell>
                  <TableCell>{source.when}</TableCell>
                  <TableCell>{nextText(source.schedule, now)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PageSection>
      ))}
    </>
  )
}
