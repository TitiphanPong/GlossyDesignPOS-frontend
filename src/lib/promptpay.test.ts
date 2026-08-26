import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePromptPayAmount } from './promptpay';

test('normalizePromptPayAmount preserves satang precision', () => {
  assert.equal(normalizePromptPayAmount(0.01), 0.01);
  assert.equal(normalizePromptPayAmount(128.4), 128.4);
  assert.equal(normalizePromptPayAmount(128.6), 128.6);
});

test('normalizePromptPayAmount rounds to two decimal places', () => {
  assert.equal(normalizePromptPayAmount(10.005), 10.01);
  assert.equal(normalizePromptPayAmount(10.004), 10);
});

test('normalizePromptPayAmount rejects invalid amounts', () => {
  assert.throws(() => normalizePromptPayAmount(Number.NaN));
  assert.throws(() => normalizePromptPayAmount(Number.POSITIVE_INFINITY));
  assert.throws(() => normalizePromptPayAmount(-0.01));
});
