import assert from 'node:assert/strict';
import test from 'node:test';
import { formatAdminHeaderDate } from './admin-header-date';

test('header matches the Gregorian timestamp and full Buddhist date requested by the user', () => {
  assert.deepEqual(formatAdminHeaderDate('2026-09-07T11:09:00.000Z'), {
    lastSynced: '07/09/2026 18:09',
    thaiDate: 'วันจันทร์ที่ 7 กันยายน พ.ศ. 2569',
  });
});

test('both header lines roll over at Bangkok midnight, including the new year', () => {
  assert.deepEqual(formatAdminHeaderDate(new Date('2026-12-31T17:00:00.000Z')), {
    lastSynced: '01/01/2027 00:00',
    thaiDate: 'วันศุกร์ที่ 1 มกราคม พ.ศ. 2570',
  });
  assert.equal(formatAdminHeaderDate('2026-12-31T16:59:00.000Z').lastSynced, '31/12/2026 23:59');
});

test('missing or invalid timestamps do not invent a sync time or throw during rendering', () => {
  for (const value of [null, undefined, '', 'invalid', new Date(Number.NaN)]) {
    assert.deepEqual(formatAdminHeaderDate(value), { lastSynced: '-', thaiDate: 'ยังไม่มีข้อมูลวันที่' });
  }
});
