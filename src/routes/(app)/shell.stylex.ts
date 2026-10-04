import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    backgroundColor: '#f7f7f8e6',
    backdropFilter: 'blur(12px)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.line
  },
  headerInner: {
    maxWidth: 880,
    marginInline: 'auto',
    height: { default: 56, [media.mobile]: 52 },
    paddingInline: { default: 24, [media.mobile]: 16 },
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  settings: {
    display: 'grid',
    placeItems: 'center',
    width: 34,
    height: 34,
    marginLeft: 'auto',
    marginRight: -8,
    borderRadius: 8,
    color: { default: tokens.muted, [media.hover]: { ':hover': tokens.ink } },
    backgroundColor: { default: 'transparent', [media.hover]: { ':hover': tokens.hover } }
  },
  current: { color: tokens.ink, backgroundColor: tokens.hover },
  demo: {
    marginLeft: 'auto',
    fontSize: 13,
    fontWeight: 500,
    color: tokens.blue,
    backgroundColor: tokens.blueSoft,
    paddingBlock: 4,
    paddingInline: 10,
    borderRadius: 999,
    whiteSpace: 'nowrap'
  },
  main: {
    width: '100%',
    maxWidth: 880,
    marginInline: 'auto',
    paddingTop: { default: 36, [media.mobile]: 20 },
    paddingInline: { default: 24, [media.mobile]: 16 },
    paddingBottom: 64
  },
  skipLink: {
    position: 'fixed',
    left: 16,
    top: { default: -100, ':focus': 12 },
    zIndex: 90,
    backgroundColor: tokens.ink,
    color: tokens.paper,
    padding: 10,
    borderRadius: 8
  }
});
