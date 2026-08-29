import assert from 'node:assert/strict';
import test from 'node:test';
import { mapSystemHealthState, parseReadinessDetails } from './system-health';

test('maps fully ready dependencies to healthy', () => {
  assert.equal(
    mapSystemHealthState({
      status: 'ready',
      checkedAt: '2026-08-29T09:00:00.000Z',
      dependencies: { database: 'ready', objectStorage: 'ready' },
    }),
    'healthy',
  );
});

test('maps partial dependency failure to degraded and total failure to unready', () => {
  assert.equal(
    mapSystemHealthState({
      status: 'unready',
      checkedAt: '2026-08-29T09:00:00.000Z',
      dependencies: { database: 'ready', objectStorage: 'unready' },
    }),
    'degraded',
  );
  assert.equal(
    mapSystemHealthState({
      status: 'unready',
      checkedAt: '2026-08-29T09:00:00.000Z',
      dependencies: { database: 'unready', objectStorage: 'unready' },
    }),
    'unready',
  );
});

test('treats missing or malformed readiness detail as unreachable', () => {
  assert.equal(mapSystemHealthState(null), 'unreachable');
  assert.equal(parseReadinessDetails({ status: 'ready', checkedAt: 'now', dependencies: { database: 'ready' } }), null);
});

test('parses only the bounded readiness detail contract', () => {
  assert.deepEqual(
    parseReadinessDetails({
      status: 'ready',
      checkedAt: '2026-08-29T09:00:00.000Z',
      dependencies: { database: 'ready', objectStorage: 'ready' },
      ignored: 'extra',
    }),
    {
      status: 'ready',
      checkedAt: '2026-08-29T09:00:00.000Z',
      dependencies: { database: 'ready', objectStorage: 'ready' },
    },
  );
});
