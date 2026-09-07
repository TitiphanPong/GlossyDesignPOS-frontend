import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDateRangeScope,
  buildExportFilename,
  formatBangkokDateScope,
  normalizeMonthScope,
  resolveOrderExportDateScope,
} from './export-filename';

test('buildExportFilename applies the shared glossy kebab-case standard', () => {
  assert.equal(
    buildExportFilename({ artifact: 'tax-invoices', variant: 'summary', scope: '2026-09', extension: '.pdf' }),
    'glossy-tax-invoices-summary-2026-09.pdf'
  );
});

test('normalizeMonthScope supports compact and dashed months', () => {
  assert.equal(normalizeMonthScope('202609'), '2026-09');
  assert.equal(normalizeMonthScope('2026-09'), '2026-09');
});

test('formatBangkokDateScope uses the Bangkok business date', () => {
  assert.equal(formatBangkokDateScope('2026-09-06T18:30:00.000Z'), '2026-09-07');
});

test('buildDateRangeScope reflects the selected day or range', () => {
  assert.equal(buildDateRangeScope('2026-09-01', '2026-09-01'), '2026-09-01');
  assert.equal(buildDateRangeScope('2026-09-01', '2026-09-07'), '2026-09-01_to_2026-09-07');
  assert.equal(buildDateRangeScope(null, null), 'all');
});

test('resolveOrderExportDateScope prioritizes month, today, range, then all', () => {
  assert.equal(resolveOrderExportDateScope({ saleMonth: '2026-09' }), '2026-09');
  assert.equal(
    resolveOrderExportDateScope({ period: 'today' }, new Date('2026-09-06T18:30:00.000Z')),
    '2026-09-07'
  );
  assert.equal(
    resolveOrderExportDateScope({ saleFrom: '2026-09-01', saleTo: '2026-09-07' }),
    '2026-09-01_to_2026-09-07'
  );
  assert.equal(resolveOrderExportDateScope({}), 'all');
});
