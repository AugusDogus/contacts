import * as stylex from '@stylexjs/stylex';

// The public landing page's palette and scale (Hallmark theme Ink, with the
// brand's faces and blue). The signed-in app keeps `#lib/tokens.stylex.ts`.
export const ink = stylex.defineVars({
  paper: 'oklch(99.5% 0.003 100)',
  paper2: 'oklch(97% 0.004 100)',
  paper3: 'oklch(94% 0.006 100)',
  ink: 'oklch(16% 0 0)',
  ink2: 'oklch(28% 0 0)',
  muted: 'oklch(44% 0 0)',
  rule: 'oklch(89% 0.004 100)',
  rule2: 'oklch(93.5% 0.003 100)',
  onInk: 'oklch(99.5% 0.003 100)',
  onInkMuted: 'oklch(78% 0 0)',
  inkRule: 'oklch(32% 0 0)',
  accent: '#3659d9',
  accentOnInk: '#9db0f5',
  accentSoft: '#eef1fd',
  focus: '#3659d9',
  display: '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif',
  body: '"Instrument Sans", ui-sans-serif, system-ui, sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, monospace',
  textDisplay: 'clamp(2.75rem, 5vw + 1rem, 5.25rem)',
  textSection: 'clamp(2rem, 2.5vw + 1rem, 3.5rem)',
  textTitle: 'clamp(1.25rem, 0.75vw + 0.875rem, 1.625rem)',
  textLead: 'clamp(1.125rem, 0.35vw + 1rem, 1.375rem)',
  tracking: '-0.04em',
  radiusCard: '12px',
  radiusControl: '10px',
  container: '1200px',
  gutter: 'clamp(16px, 5vw, 64px)',
  sectionGap: 'clamp(72px, 10vw, 144px)',
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  durMicro: '120ms',
  durShort: '220ms'
});

export const at = stylex.defineConsts({
  stack: '@media (max-width: 60rem)',
  phone: '@media (max-width: 40rem)',
  hover: '@media (hover: hover) and (pointer: fine)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)'
});
