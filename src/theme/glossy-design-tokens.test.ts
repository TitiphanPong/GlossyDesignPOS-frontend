import assert from 'node:assert/strict';
import test from 'node:test';
import { glossyCssVariables, glossyDesignTokens } from './glossy-design-tokens';

test('Glossy brand identity uses the owner-approved Paper, Ink, and Cyan values', () => {
  assert.equal(glossyDesignTokens.brand.ink, '#111318');
  assert.equal(glossyDesignTokens.brand.paper, '#F7F4ED');
  assert.equal(glossyDesignTokens.brand.cyan, '#00A9CE');
  assert.equal(glossyDesignTokens.brand.cyanStrong, '#007F96');
});

test('operational primary is distinct from decorative brand cyan', () => {
  assert.equal(glossyDesignTokens.action.primary, glossyDesignTokens.brand.cyanStrong);
  assert.notEqual(glossyDesignTokens.action.primary, glossyDesignTokens.brand.cyan);
});

test('CSS variables are derived from the same canonical token source', () => {
  assert.equal(glossyCssVariables['--glossy-action-primary'], glossyDesignTokens.action.primary);
  assert.equal(glossyCssVariables['--glossy-action-primary-soft'], glossyDesignTokens.action.primarySoft);
  assert.equal(glossyCssVariables['--glossy-action-primary-border'], glossyDesignTokens.action.primaryBorder);
  assert.equal(glossyCssVariables['--glossy-surface-page'], glossyDesignTokens.surface.page);
  assert.equal(glossyCssVariables['--glossy-surface-overlay'], glossyDesignTokens.surface.overlay);
  assert.equal(glossyCssVariables['--glossy-text-primary'], glossyDesignTokens.text.primary);
  assert.equal(glossyCssVariables['--glossy-status-success'], glossyDesignTokens.status.success);
  assert.equal(glossyCssVariables['--glossy-status-error'], glossyDesignTokens.status.error);
});
