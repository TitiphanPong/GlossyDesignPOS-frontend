import assert from 'node:assert/strict';
import test from 'node:test';
import { glossyDesignTokens } from '@/theme/glossy-design-tokens';
import { appTheme } from './app-theme';
import { DOCUMENT_FONT_FAMILY, UI_FONT_FAMILY } from './font-tokens';

test('MUI typography uses the shared Prompt UI font token', () => {
  assert.equal(appTheme.typography.fontFamily, UI_FONT_FAMILY);
});

test('formal documents use the dedicated Noto Sans Thai document token', () => {
  assert.equal(DOCUMENT_FONT_FAMILY, 'var(--font-document)');
});

test('MUI application palette is derived from the canonical Glossy semantic tokens', () => {
  assert.equal(appTheme.palette.primary.main, glossyDesignTokens.action.primary);
  assert.equal(appTheme.palette.background.default, glossyDesignTokens.surface.page);
  assert.equal(appTheme.palette.background.paper, glossyDesignTokens.surface.card);
  assert.equal(appTheme.palette.text.primary, glossyDesignTokens.text.primary);
  assert.equal(appTheme.palette.text.secondary, glossyDesignTokens.text.secondary);
  assert.equal(appTheme.palette.divider, glossyDesignTokens.border.default);
});
