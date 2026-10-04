import * as stylex from '@stylexjs/stylex';

export const tokens = stylex.defineVars({
  ink: '#1e2330',
  muted: '#6b7280',
  faint: '#9ca3af',
  blue: '#3659d9',
  blueSoft: '#eef1fd',
  line: '#ebecef',
  field: '#dcdfe5',
  paper: '#ffffff',
  surface: '#f7f7f8',
  hover: '#f3f4f6',
  danger: '#b42336',
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
