export const transitionDuration = {
  press: 90,
  hover: 100,
  menu: 120,
  page: 160,
  modal: 200,
  drawer: 220,
} as const;

export const transitionEasing = {
  enter: 'cubic-bezier(0.2, 0, 0, 1)',
  standard: 'ease',
} as const;
