import { transitionDuration, transitionEasing } from '@/components/transitions/transition.config';

export const sidebarTokens = {
  background: '#F7F4ED',
  backgroundElevated: '#FBFAF6',
  border: 'rgba(18, 21, 17, 0.13)',
  borderStrong: 'rgba(18, 21, 17, 0.2)',
  text: '#121511',
  textSoft: '#31352F',
  textMuted: '#6B6D67',
  activeBackground: '#ECE7DD',
  activeText: '#121511',
  hoverBackground: 'rgba(232, 226, 216, 0.72)',
  focusRing: '#121511',
  paperDeep: '#E8E2D8',
  cyan: '#00A9CE',
  magenta: '#DF167F',
  yellow: '#F4CF3F',
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
