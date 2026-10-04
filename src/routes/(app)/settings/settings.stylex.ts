import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  stack: { maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 32 },
  sectionHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10
  },
  title: { fontFamily: tokens.font, fontSize: 14, fontWeight: 600, letterSpacing: 0 },
  body: { padding: { default: 18, [media.mobile]: 14 }, overflow: 'visible' },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingBlock: 12,
    paddingInline: { default: 16, [media.mobile]: 14 }
  },
  rowText: { flexGrow: 1, minWidth: 0, lineHeight: 1.35, overflowWrap: 'anywhere' },
  rowTitle: { fontWeight: 500 },
  rowDetail: { fontSize: 13, color: tokens.muted },
  fine: { fontSize: 13, marginTop: 10 },
  claim: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    backgroundColor: tokens.blueSoft,
    borderRadius: 12,
    paddingBlock: 12,
    paddingInline: 16
  },
  claimTitle: { fontFamily: tokens.font, fontSize: 15, fontWeight: 500, letterSpacing: 0 },
  address: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 6,
    paddingRight: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: tokens.field, ':focus-within': tokens.blue },
    borderRadius: 8,
    backgroundColor: tokens.paper,
    outline: { default: 'none', ':focus-within': `3px solid ${tokens.blueSoft}` },
    outlineOffset: 0
  },
  slugInput: {
    flexGrow: 1,
    minWidth: 60,
    minHeight: 40,
    paddingBlock: 9,
    paddingLeft: 12,
    paddingRight: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: tokens.ink,
    outline: 'none'
  },
  suffix: { color: tokens.faint, fontWeight: 400, whiteSpace: 'nowrap' }
});
