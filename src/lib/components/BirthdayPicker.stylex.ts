import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';

const pop = stylex.keyframes({
  from: { opacity: 0, transform: 'translateY(-4px) scale(.98)' },
  to: { opacity: 1, transform: 'none' }
});

export const styles = stylex.create({
  field: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    minHeight: 42,
    paddingLeft: 12,
    paddingRight: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: tokens.field, ':focus-within': tokens.blue },
    borderRadius: 8,
    backgroundColor: tokens.paper,
    outline: { default: 'none', ':focus-within': `3px solid ${tokens.blueSoft}` },
    transition: 'border-color 150ms ease',
    cursor: 'text'
  },
  invalid: { borderColor: tokens.danger },
  segments: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    fontVariantNumeric: 'tabular-nums'
  },
  segment: {
    paddingBlock: 1,
    paddingInline: 2,
    borderRadius: 4,
    color: tokens.ink,
    outline: 'none',
    caretColor: 'transparent',
    backgroundColor: { default: 'transparent', ':focus': tokens.blueSoft }
  },
  empty: { color: tokens.faint },
  literal: { color: tokens.faint, paddingInline: 1 },
  icon: {
    display: 'grid',
    placeItems: 'center',
    width: 32,
    height: 32,
    padding: 0,
    borderWidth: 0,
    borderRadius: 6,
    backgroundColor: { default: 'transparent', [media.hover]: { ':hover': tokens.hover } },
    color: tokens.muted,
    flexShrink: 0,
    outlineOffset: -2
  },
  content: {
    zIndex: 50,
    width: 280,
    padding: 12,
    backgroundColor: tokens.paper,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 12,
    boxShadow: '0 10px 38px -10px #1e233040, 0 10px 20px -15px #1e233033',
    transformOrigin: 'var(--bits-floating-transform-origin)',
    animationName: pop,
    animationDuration: '160ms',
    animationTimingFunction: tokens.easeOut,
    outline: 'none'
  },
  header: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 },
  select: {
    height: 30,
    paddingInline: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: 'transparent', [media.hover]: { ':hover': tokens.field } },
    borderRadius: 6,
    backgroundColor: 'transparent',
    color: tokens.ink,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer'
  },
  spacer: { flexGrow: 1 },
  nav: {
    display: 'grid',
    placeItems: 'center',
    width: 30,
    height: 30,
    padding: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 6,
    backgroundColor: { default: tokens.paper, [media.hover]: { ':hover': tokens.hover } },
    color: tokens.ink,
    opacity: { default: 1, ':disabled': 0.4 }
  },
  grid: { width: '100%', borderCollapse: 'collapse', userSelect: 'none' },
  row: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 },
  weekday: {
    fontSize: 12,
    fontWeight: 500,
    color: tokens.faint,
    paddingBottom: 4,
    textAlign: 'center'
  },
  cell: { padding: 0, textAlign: 'center' },
  day: {
    display: 'grid',
    placeItems: 'center',
    width: '100%',
    aspectRatio: '1',
    borderRadius: 7,
    fontSize: 14,
    color: tokens.ink,
    cursor: 'pointer',
    backgroundColor: { default: 'transparent', [media.hover]: { ':hover': tokens.hover } },
    outline: { default: 'none', ':focus-visible': `2px solid ${tokens.blue}` },
    outlineOffset: -2
  },
  outside: { color: tokens.faint },
  today: { fontWeight: 700, color: tokens.blue },
  disabled: { color: '#d1d5db', cursor: 'default', pointerEvents: 'none' },
  selected: {
    backgroundColor: { default: tokens.ink, [media.hover]: { ':hover': tokens.ink } },
    color: tokens.paper,
    fontWeight: 600
  }
});
