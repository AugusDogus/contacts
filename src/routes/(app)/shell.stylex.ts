import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    backgroundColor: tokens.paper,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.line
  },
  headerInner: {
    maxWidth: 1040,
    marginInline: 'auto',
    height: { default: 64, [media.mobile]: 56 },
    paddingInline: { default: 32, [media.mobile]: 20 },
    display: 'flex',
    alignItems: 'center',
    gap: 40
  },
  nav: {
    display: 'flex',
    gap: 4,
    position: { default: 'static', [media.mobile]: 'fixed' },
    insetInline: 0,
    bottom: 0,
    zIndex: 20,
    backgroundColor: tokens.paper,
    borderTopWidth: { default: 0, [media.mobile]: 1 },
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    paddingBottom: { default: 0, [media.mobile]: 'env(safe-area-inset-bottom)' },
    justifyContent: { default: 'flex-start', [media.mobile]: 'space-around' }
  },
  navLink: {
    display: 'flex',
    flexDirection: { default: 'row', [media.mobile]: 'column' },
    alignItems: 'center',
    gap: { default: 8, [media.mobile]: 3 },
    paddingBlock: { default: 8, [media.mobile]: 9 },
    paddingInline: { default: 12, [media.mobile]: 4 },
    flexGrow: { default: 0, [media.mobile]: 1 },
    borderRadius: { default: 8, [media.mobile]: 0 },
    color: tokens.muted,
    fontSize: { default: 14, [media.mobile]: 11 },
    fontWeight: 500,
    backgroundColor: { default: 'transparent', [media.hover]: { ':hover': tokens.surface } }
  },
  navCurrent: {
    color: { default: tokens.ink, [media.mobile]: tokens.blue },
    backgroundColor: { default: tokens.surface, [media.mobile]: 'transparent' },
    fontWeight: 600
  },
  demoLabel: { display: { default: 'inline', [media.mobile]: 'none' } },
  demo: { marginLeft: 'auto', fontSize: 13, color: tokens.muted, whiteSpace: 'nowrap' },
  main: {
    width: '100%',
    maxWidth: 1040,
    marginInline: 'auto',
    paddingTop: { default: 40, [media.mobile]: 24 },
    paddingInline: { default: 32, [media.mobile]: 20 },
    paddingBottom: { default: 64, [media.mobile]: 96 }
  },
  skipLink: {
    position: 'fixed',
    left: 16,
    top: { default: -100, ':focus': 12 },
    zIndex: 90,
    backgroundColor: tokens.blue,
    color: tokens.paper,
    padding: 10,
    borderRadius: 8
  }
});
