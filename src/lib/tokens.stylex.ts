import * as stylex from '@stylexjs/stylex';

export const tokens = stylex.defineVars({
  ink: '#293247',
  muted: '#727d90',
  blue: '#3659d9',
  blueSoft: '#edf1ff',
  line: '#e8eaf0',
  paper: '#ffffff',
  surface: '#f7f8fa',
  sage: '#f0f3ed',
  font: '"Instrument Sans", sans-serif',
  heading: '"Bricolage Grotesque", sans-serif',
  easeOut: 'cubic-bezier(.23,1,.32,1)'
});
export const media = stylex.defineConsts({
  mobile: '@media (max-width: 650px)',
  tablet: '@media (max-width: 800px)',
  compact: '@media (max-width: 1100px)',
  hover: '@media (hover: hover) and (pointer: fine)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)'
});
