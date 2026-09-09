import { transitionDuration, transitionEasing } from '@/components/transitions/transition.config';
import { glossyDesignTokens } from '@/theme/glossy-design-tokens';

export const sidebarTokens = {
  background: glossyDesignTokens.brand.paper,
  backgroundElevated: glossyDesignTokens.surface.raised,
  border: glossyDesignTokens.border.default,
  borderStrong: glossyDesignTokens.border.strong,
  text: glossyDesignTokens.text.primary,
  textSoft: glossyDesignTokens.text.soft,
  textMuted: glossyDesignTokens.text.secondary,
  activeBackground: glossyDesignTokens.surface.active,
  activeText: glossyDesignTokens.text.primary,
  hoverBackground: glossyDesignTokens.surface.hoverWarm,
  focusRing: glossyDesignTokens.brand.ink,
  paperDeep: glossyDesignTokens.surface.paperDeep,
  cyan: glossyDesignTokens.brand.cyan,
  magenta: glossyDesignTokens.brand.magenta,
  yellow: glossyDesignTokens.brand.yellow,
  registrationBlack: '#24231F',
  danger: '#B42318',
  dangerBackground: 'rgba(180, 35, 24, 0.08)',
  shadow: '6px 0 24px rgba(37, 34, 28, 0.07)',
  floatingShadow: '0 14px 34px rgba(37, 34, 28, 0.14)',
  scrollbar: 'rgba(49, 53, 47, 0.24)',
} as const;

export const sidebarDimensions = {
  expanded: 268,
  collapsed: 76,
  mobile: 304,
  itemHeight: 44,
  compactItemHeight: 40,
} as const;

export const sidebarMotion = {
  interaction: `${transitionDuration.menu}ms ${transitionEasing.standard}`,
  icon: `${transitionDuration.hover}ms ${transitionEasing.standard}`,
  drawer: `${transitionDuration.drawer}ms ${transitionEasing.enter}`,
  menuDuration: transitionDuration.menu,
} as const;
