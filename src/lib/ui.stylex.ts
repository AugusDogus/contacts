import * as stylex from '@stylexjs/stylex';
import { tokens, media } from './tokens.stylex';

export const ui = stylex.create({
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBlock: 10,
    paddingInline: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: '#dfe3eb', [media.hover]: { ':hover': '#cbd2df' } },
    backgroundColor: { default: tokens.paper, [media.hover]: { ':hover': '#f8f9fc' } },
    color: tokens.ink,
    fontSize: 14,
    fontWeight: 600,
    minHeight: 42,
    whiteSpace: 'nowrap',
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    opacity: { default: 1, ':disabled': 0.55 },
    transition: { default: `transform 130ms ${tokens.easeOut}`, [media.reducedMotion]: 'none' },
    transform: {
      default: 'none',
      ':active:not(:focus-visible):not(:disabled)': 'scale(.98)',
      [media.reducedMotion]: 'none'
    }
  },
  primary: {
    backgroundColor: { default: tokens.blue, [media.hover]: { ':hover': '#2c4dcc' } },
    color: tokens.paper,
    borderColor: tokens.blue,
    boxShadow: '0 2px 3px #2949bc18'
  },
  danger: { color: '#ad3e4e', borderColor: '#f0d9dd' },
  full: { width: '100%' },
  small: { paddingBlock: 7, paddingInline: 12, minHeight: 36, fontSize: 13 },
  iconButton: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 34,
    height: 34,
    padding: 0,
    backgroundColor: { default: 'transparent', [media.hover]: { ':hover': '#f0f2f7' } },
    color: tokens.muted,
    borderWidth: 0,
    borderRadius: 7,
    cursor: 'pointer',
    flexShrink: 0
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#dfe3eb',
    backgroundColor: tokens.paper,
    color: tokens.ink,
    borderRadius: 8,
    paddingBlock: 11,
    paddingInline: 13,
    minHeight: 44,
    marginTop: 7
  },
  checkbox: {
    width: 16,
    height: 16,
    minHeight: 16,
    padding: 0,
    accentColor: tokens.blue,
    flexShrink: 0,
    marginTop: 0
  },
  muted: { color: tokens.muted },
  subtitle: { color: tokens.muted, marginTop: 6, fontSize: 15, maxWidth: 560 },
  pageHeading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
    flexWrap: 'wrap'
  },
  textButton: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
    color: tokens.blue,
    fontSize: 'inherit',
    fontWeight: 500,
    textDecoration: { default: 'none', [media.hover]: { ':hover': 'underline' } }
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 5,
    paddingBlock: 3,
    paddingInline: 8,
    fontSize: 12,
    fontWeight: 500,
    backgroundColor: '#f0f2f6',
    color: '#626e82'
  },
  green: { color: '#467559', backgroundColor: '#edf5ee' },
  amber: { color: '#96752b', backgroundColor: '#fbf5e6' },
  panel: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 13,
    backgroundColor: tokens.paper,
    overflow: 'hidden'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: { default: '1fr 1fr', [media.mobile]: '1fr' },
    gap: 18
  },
  span2: { gridColumn: { default: '1 / -1', [media.mobile]: 'auto' } },
  formStack: { display: 'flex', flexDirection: 'column', gap: 20 },
  formError: {
    backgroundColor: '#fff1f2',
    color: '#a13748',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#f3d9de',
    borderRadius: 8,
    paddingBlock: 12,
    paddingInline: 14,
    fontSize: 13
  },
  help: { fontSize: 13, color: tokens.muted, fontWeight: 400, marginTop: 6 },
  emptyState: {
    textAlign: 'center',
    paddingBlock: 56,
    paddingInline: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14
  },
  emptyText: { maxWidth: 400, color: tokens.muted },
  emptyIcon: {
    display: 'grid',
    placeItems: 'center',
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: tokens.blueSoft,
    color: tokens.blue,
    marginBottom: 5
  },
  segmented: {
    display: 'flex',
    maxWidth: '100%',
    overflowX: 'auto',
    padding: 3,
    gap: 2,
    borderRadius: 9,
    backgroundColor: '#eef0f4'
  },
  segment: {
    borderWidth: 0,
    borderRadius: 7,
    paddingBlock: 7,
    paddingInline: 12,
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    color: tokens.muted,
    backgroundColor: 'transparent'
  },
  segmentOn: {
    color: tokens.ink,
    backgroundColor: tokens.paper,
    boxShadow: '0 1px 2px #29324718'
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
    gap: 12,
    paddingBlock: 10,
    paddingInline: 17,
    backgroundColor: tokens.ink,
    color: tokens.paper,
    borderRadius: 11,
    boxShadow: '0 8px 30px #29324722',
    maxWidth: 520,
    fontSize: 13
  }
});
