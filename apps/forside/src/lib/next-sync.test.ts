import assert from 'node:assert/strict'
import { test } from 'node:test'

import { describeNext, everyThreeHours, nextRun, weekly } from './next-sync.ts'

const iso = (date: Date) => date.toISOString()

test('every three hours picks the next slot of the day, and rolls over midnight', () => {
  assert.equal(iso(nextRun(everyThreeHours(0), new Date('2026-10-28T10:00:00Z'))), '2026-10-28T12:00:00.000Z')
  assert.equal(iso(nextRun(everyThreeHours(0), new Date('2026-10-28T22:30:00Z'))), '2026-10-29T00:00:00.000Z')
})

test('a weekly run waits for its weekday', () => {
  assert.equal(iso(nextRun(weekly(1, 5, 0), new Date('2026-10-28T10:00:00Z'))), '2026-11-02T05:00:00.000Z')
  assert.equal(iso(nextRun(weekly(1, 5, 0), new Date('2026-11-02T04:59:00Z'))), '2026-11-02T05:00:00.000Z')
})

test('the next run is described by day and time in Norwegian time, winter and summer', () => {
  const winter = new Date('2026-11-10T10:00:00Z')
  assert.equal(describeNext(nextRun(everyThreeHours(0), winter), winter), 'i dag 13:00')
  assert.equal(describeNext(nextRun(everyThreeHours(0), new Date('2026-11-10T22:30:00Z')), new Date('2026-11-10T22:30:00Z')), 'i morgen 01:00')
  assert.equal(describeNext(nextRun(weekly(1, 5, 0), winter), winter), 'mandag 06:00')
  const summer = new Date('2026-07-01T10:00:00Z')
  assert.equal(describeNext(nextRun(everyThreeHours(0), summer), summer), 'i dag 14:00')
})
