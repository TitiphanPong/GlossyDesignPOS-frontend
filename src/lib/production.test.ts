import test from 'node:test';
import assert from 'node:assert/strict';
import { bangkokLocalDateTimeToIso, nextProductionStage, productionJobsPath } from './production';

test('nextProductionStage follows the server-owned forward-only production sequence', () => {
  assert.equal(nextProductionStage('file_check'), 'queued');
  assert.equal(nextProductionStage('queued'), 'producing');
  assert.equal(nextProductionStage('producing'), 'quality_check');
  assert.equal(nextProductionStage('quality_check'), 'ready');
  assert.equal(nextProductionStage('ready'), 'delivered');
  assert.equal(nextProductionStage('delivered'), null);
});

test('bangkokLocalDateTimeToIso treats datetime-local input as Asia/Bangkok', () => {
  assert.equal(bangkokLocalDateTimeToIso('2026-08-30T17:30'), '2026-08-30T10:30:00.000Z');
  assert.throws(() => bangkokLocalDateTimeToIso('2026-08-30'), /วันและเวลา/);
});

test('productionJobsPath serializes operational filters without payment fields', () => {
  const path = productionJobsPath({
    stage: 'producing',
    priority: 'rush',
    due: 'overdue',
    active: true,
    assigneeUserId: 'staff-1',
    jobType: ' นามบัตร ',
    q: ' ORD-42 ',
    page: 3,
    limit: 50,
  });
  const url = new URL(path, 'http://local.test');

  assert.equal(url.pathname, '/production/jobs');
  assert.equal(url.searchParams.get('stage'), 'producing');
  assert.equal(url.searchParams.get('priority'), 'rush');
  assert.equal(url.searchParams.get('due'), 'overdue');
  assert.equal(url.searchParams.get('active'), 'true');
  assert.equal(url.searchParams.get('assigneeUserId'), 'staff-1');
  assert.equal(url.searchParams.get('jobType'), 'นามบัตร');
  assert.equal(url.searchParams.get('q'), 'ORD-42');
  assert.equal(url.searchParams.get('page'), '3');
  assert.equal(url.searchParams.get('limit'), '50');
  assert.equal(url.searchParams.has('payment'), false);
  assert.equal(url.searchParams.has('total'), false);
});
