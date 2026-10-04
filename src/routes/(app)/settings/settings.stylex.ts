import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  stack: { display: 'flex', flexDirection: 'column', gap: { default: 0, [media.tablet]: 28 } },
  // Labels on the left and controls on the right; one column on narrow screens.
  section: {
    display: 'grid',
    gridTemplateColumns: { default: '220px minmax(0, 1fr)', [media.tablet]: 'minmax(0, 1fr)' },
    columnGap: 40,
    rowGap: 10,
    alignItems: 'start',
    paddingBlock: { default: 28, [media.tablet]: 0 },
    borderTopWidth: { default: 1, ':first-child': 0, [media.tablet]: 0 },
    borderTopStyle: 'solid',
    borderTopColor: tokens.line
  },
  sectionHead: { paddingTop: { default: 4, [media.tablet]: 0 } },
  title: { fontFamily: tokens.font, fontSize: 15, fontWeight: 600, letterSpacing: 0 },
  hint: { fontSize: 13, color: tokens.muted, marginTop: 2 },
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
    marginBottom: 24,
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
