import assert from 'node:assert/strict';
import test from 'node:test';
import { glossyCssVariables, glossyDesignTokens, withAlpha } from './glossy-design-tokens';

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

test('withAlpha derives translucent display colors from canonical hex tokens', () => {
  assert.equal(withAlpha(glossyDesignTokens.display.cyan, 0.35), 'rgba(0, 169, 206, 0.35)');
  assert.equal(withAlpha(glossyDesignTokens.status.success, 0.45), 'rgba(46, 139, 87, 0.45)');
  assert.equal(withAlpha(glossyDesignTokens.display.shellDeep, 2), 'rgba(8, 10, 13, 1)');
  assert.equal(withAlpha(glossyDesignTokens.display.shellDeep, -1), 'rgba(8, 10, 13, 0)');
  assert.throws(() => withAlpha('transparent', 0.5));
});

test('CSS variables are derived from the same canonical token source', () => {
  assert.equal(glossyCssVariables['--glossy-action-primary'], glossyDesignTokens.action.primary);
  assert.equal(glossyCssVariables['--glossy-action-primary-soft'], glossyDesignTokens.action.primarySoft);
  assert.equal(glossyCssVariables['--glossy-action-primary-border'], glossyDesignTokens.action.primaryBorder);
  assert.equal(glossyCssVariables['--glossy-surface-page'], glossyDesignTokens.surface.page);
  assert.equal(glossyCssVariables['--glossy-surface-overlay'], glossyDesignTokens.surface.overlay);
  assert.equal(glossyCssVariables['--glossy-text-primary'], glossyDesignTokens.text.primary);
  assert.equal(glossyCssVariables['--glossy-display-shell'], glossyDesignTokens.display.shell);
  assert.equal(glossyCssVariables['--glossy-display-surface'], glossyDesignTokens.display.surface);
  assert.equal(glossyCssVariables['--glossy-display-cyan'], glossyDesignTokens.display.cyan);
  assert.equal(glossyCssVariables['--glossy-display-text-secondary'], glossyDesignTokens.display.textSecondary);
  assert.equal(glossyCssVariables['--glossy-status-success'], glossyDesignTokens.status.success);
  assert.equal(glossyCssVariables['--glossy-status-error'], glossyDesignTokens.status.error);
});
