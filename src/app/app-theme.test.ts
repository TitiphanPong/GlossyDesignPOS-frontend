import assert from 'node:assert/strict';
import test from 'node:test';
import { appTheme } from './app-theme';
import { DOCUMENT_FONT_FAMILY, UI_FONT_FAMILY } from './font-tokens';

test('MUI typography uses the shared Prompt UI font token', () => {
  assert.equal(appTheme.typography.fontFamily, UI_FONT_FAMILY);
});

test('formal documents use the dedicated Noto Sans Thai document token', () => {
  assert.equal(DOCUMENT_FONT_FAMILY, 'var(--font-document)');
});
