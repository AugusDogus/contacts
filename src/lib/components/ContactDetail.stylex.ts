import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';
export const styles = stylex.create({
  personHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    paddingTop: 5,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.line
  },
  favoriteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#faf7ee',
    borderWidth: 0,
    borderRadius: 5,
    paddingBlock: 5,
    paddingInline: 10,
    color: '#917635',
    fontSize: 11
  },
  details: { paddingBlock: 24, display: 'flex', flexDirection: 'column', gap: 20 },
  detailRow: { display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 13 },
  detailText: { minWidth: 0, overflowWrap: 'anywhere' },
  detailLabel: { display: 'block', fontSize: 11, color: tokens.muted, marginBottom: 4 },
  notes: { whiteSpace: 'pre-line' },
  detailActions: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    paddingTop: 20,
    display: 'flex',
    justifyContent: 'space-between'
  },
  removeConfirm: { backgroundColor: '#fff5f5', padding: 15, borderRadius: 8, fontSize: 12 },
  confirmActions: { display: 'flex', gap: 10, marginTop: 15 }
});
