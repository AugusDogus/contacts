import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
export const styles = stylex.create({
  top: { display: 'flex', alignItems: 'center', gap: 14 },
  topText: { flexGrow: 1, minWidth: 0, color: tokens.muted, fontSize: 14 },
  favoriteOn: {
    color: '#8a6417',
    borderColor: { default: '#efdfb4', [media.hover]: { ':hover': '#e5cf94' } },
    backgroundColor: { default: '#fbf2de', [media.hover]: { ':hover': '#f8ebcd' } }
  },
  source: { fontSize: 13, color: tokens.faint, marginBottom: 16 },
  details: { marginTop: 20, marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 12 },
  row: {
    display: 'grid',
    gridTemplateColumns: { default: '84px minmax(0,1fr)', [media.mobile]: '1fr' },
    gap: { default: 12, [media.mobile]: 0 }
  },
  term: { color: tokens.muted, fontSize: 14 },
  value: { margin: 0, overflowWrap: 'anywhere' },
  lines: { whiteSpace: 'pre-line' },
  actions: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  footer: {
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    paddingTop: 16
  },
  remove: { color: tokens.danger },
  confirm: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: '#fdf1f2',
    paddingBlock: 10,
    paddingInline: 12,
    borderRadius: 10,
    fontSize: 14
  }
});
