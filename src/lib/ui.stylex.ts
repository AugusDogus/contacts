import * as stylex from '@stylexjs/stylex';
import { tokens, media } from './tokens.stylex';

const enter = stylex.keyframes({
  from: { opacity: 0, transform: 'translateY(6px)' },
  to: { opacity: 1, transform: 'none' }
});

export const ui = stylex.create({
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingBlock: 8,
    paddingInline: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: tokens.field, [media.hover]: { ':hover': '#c9cdd5' } },
    backgroundColor: { default: tokens.paper, [media.hover]: { ':hover': tokens.surface } },
    color: tokens.ink,
    fontSize: 14,
    fontWeight: 600,
    minHeight: 38,
    whiteSpace: 'nowrap',
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    opacity: { default: 1, ':disabled': 0.55 },
    transition: {
      default: `transform 140ms ${tokens.easeOut}, background-color 150ms ease, border-color 150ms ease`,
      [media.reducedMotion]: 'background-color 150ms ease'
    },
    transform: {
      default: 'none',
      ':active:not(:disabled)': 'scale(.97)',
      [media.reducedMotion]: 'none'
    }
  },
  primary: {
    backgroundColor: { default: tokens.ink, [media.hover]: { ':hover': '#343b4d' } },
    color: tokens.paper,
    borderColor: { default: tokens.ink, [media.hover]: { ':hover': '#343b4d' } }
  },
  danger: {
    color: tokens.danger,
    borderColor: { default: '#f0d4d8', [media.hover]: { ':hover': '#e6b9c0' } }
  },
  full: { width: '100%', minHeight: 44 },
  small: { paddingBlock: 5, paddingInline: 10, minHeight: 32, fontSize: 13 },
  iconButton: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 34,
    height: 34,
    padding: 0,
    backgroundColor: { default: 'transparent', [media.hover]: { ':hover': tokens.hover } },
    color: tokens.muted,
    borderWidth: 0,
    borderRadius: 8,
    cursor: 'pointer',
    flexShrink: 0,
    transition: { default: `transform 140ms ${tokens.easeOut}`, [media.reducedMotion]: 'none' },
    transform: { default: 'none', ':active': 'scale(.94)', [media.reducedMotion]: 'none' }
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: tokens.field, ':focus': tokens.blue },
    backgroundColor: tokens.paper,
    color: tokens.ink,
    borderRadius: 8,
    paddingBlock: 9,
    paddingInline: 12,
    minHeight: 42,
    marginTop: 6,
    outline: { default: null, ':focus-visible': `3px solid ${tokens.blueSoft}` },
    outlineOffset: 0,
    transition: 'border-color 150ms ease'
  },
  muted: { color: tokens.muted },
  pageHeading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: { default: 24, [media.mobile]: 18 },
    minHeight: 38
  },
  back: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    marginLeft: -2,
    fontSize: 14,
    fontWeight: 500,
    color: { default: tokens.muted, [media.hover]: { ':hover': tokens.ink } }
  },
  count: {
    marginLeft: 8,
    fontFamily: tokens.font,
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: 0,
    color: tokens.faint
  },
  textButton: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
    color: tokens.blue,
    fontSize: 'inherit',
    fontWeight: 500,
    textDecoration: { default: 'none', [media.hover]: { ':hover': 'underline' } },
    textUnderlineOffset: 3
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingBlock: 2,
    paddingInline: 9,
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    backgroundColor: tokens.hover,
    color: tokens.muted
  },
  green: { color: '#2f6b47', backgroundColor: '#e8f3ec' },
  amber: { color: '#8a6417', backgroundColor: '#fbf2de' },
  panel: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 12,
    backgroundColor: tokens.paper,
    overflow: 'hidden'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: { default: '1fr 1fr', [media.mobile]: '1fr' },
    columnGap: 14,
    rowGap: 16
  },
  span2: { gridColumn: { default: '1 / -1', [media.mobile]: 'auto' } },
  formStack: { display: 'flex', flexDirection: 'column', gap: 16 },
  formError: {
    backgroundColor: '#fdf1f2',
    color: tokens.danger,
    borderRadius: 8,
    paddingBlock: 10,
    paddingInline: 12,
    fontSize: 14
  },
  help: { fontSize: 13, color: tokens.muted, fontWeight: 400, marginTop: 6 },
  emptyState: {
    textAlign: 'center',
    paddingBlock: { default: 56, [media.mobile]: 40 },
    paddingInline: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12
  },
  emptyText: { maxWidth: 360, color: tokens.muted },
  emptyIcon: {
    display: 'grid',
    placeItems: 'center',
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: tokens.blueSoft,
    color: tokens.blue,
    marginBottom: 4
  },
  segmented: {
    display: 'flex',
    maxWidth: '100%',
    overflowX: 'auto',
    padding: 3,
    gap: 2,
    borderRadius: 9,
    backgroundColor: tokens.hover
  },
  segment: {
    borderWidth: 0,
    borderRadius: 6,
    paddingBlock: 5,
    paddingInline: 11,
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    color: tokens.muted,
    backgroundColor: 'transparent',
    transition: 'background-color 150ms ease, color 150ms ease'
  },
  segmentOn: {
    color: tokens.ink,
    backgroundColor: tokens.paper,
    boxShadow: '0 1px 2px #1e233014'
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0
  },
  toastRegion: {
    position: 'fixed',
    zIndex: 100,
    bottom: { default: 24, [media.mobile]: 84 },
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'max-content',
    maxWidth: 'calc(100vw - 32px)'
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBlock: 6,
    paddingLeft: 14,
    paddingRight: 6,
    backgroundColor: tokens.ink,
    color: tokens.paper,
    borderRadius: 10,
    boxShadow: '0 8px 30px #1e233026',
    maxWidth: 520,
    fontSize: 14,
    animationName: enter,
    animationDuration: '220ms',
    animationTimingFunction: tokens.easeOut,
    animationFillMode: 'both'
  },
  toastClose: { color: '#ffffffa0', width: 30, height: 30 }
});
