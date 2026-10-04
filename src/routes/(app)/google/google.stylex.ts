import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    paddingBlock: 16,
    paddingInline: { default: 18, [media.mobile]: 14 },
    flexWrap: { default: 'nowrap', [media.mobile]: 'wrap' },
    borderTopWidth: { default: 1, ':first-child': 0 },
    borderTopStyle: 'solid',
    borderTopColor: tokens.line
  },
  icon: {
    display: 'grid',
    placeItems: 'center',
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: tokens.surface,
    color: tokens.muted,
    flexShrink: 0
  },
  text: { flexGrow: 1, flexBasis: 0, minWidth: 0, lineHeight: 1.35 },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: tokens.font,
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: 0
  },
  detail: { fontSize: 13, color: tokens.muted },
  actions: {
    display: 'flex',
    gap: 8,
    marginLeft: { default: 0, [media.mobile]: 50 }
  },
  notes: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingInline: { default: 18, [media.mobile]: 14 },
    paddingBottom: 16,
    marginTop: -4
  },
  uncertain: {
    fontSize: 14,
    color: '#7a5a17',
    backgroundColor: '#fbf2de',
    paddingBlock: 10,
    paddingInline: 12,
    borderRadius: 8
  },
  uncertainList: { paddingLeft: 20, marginTop: 6, marginBottom: 0 },
  review: {
    fontSize: 14,
    backgroundColor: tokens.surface,
    borderRadius: 8,
    paddingBlock: 10,
    paddingInline: 12
  },
  reviewTitle: { color: tokens.muted, marginBottom: 6 },
  reviewList: { listStyle: 'none', margin: 0, padding: 0 },
  reviewItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    paddingBlock: 8,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    flexWrap: { default: 'nowrap', [media.mobile]: 'wrap' }
  },
  reviewText: { flexGrow: 1, minWidth: 0, overflowWrap: 'anywhere' },
  reviewName: { fontWeight: 500 },
  reviewDetail: { fontSize: 13, color: tokens.muted },
  reviewActions: { display: 'flex', gap: 6, flexShrink: 0 },
  fine: { fontSize: 13, color: tokens.muted, marginTop: 12 }
});
