import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
export const styles = stylex.create({
  top: { display: 'flex', alignItems: 'center', gap: 16 },
  topText: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 },
  favorite: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingBlock: 5,
    paddingInline: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    backgroundColor: { default: tokens.paper, [media.hover]: { ':hover': tokens.surface } },
    color: tokens.muted,
    fontSize: 13,
    fontWeight: 500
  },
  favoriteOn: { color: '#8a6a1f', borderColor: '#efe1bb', backgroundColor: '#fbf5e6' },
  details: { marginBlock: 24, display: 'flex', flexDirection: 'column', gap: 14 },
  row: {
    display: 'grid',
    gridTemplateColumns: { default: '96px minmax(0,1fr)', [media.mobile]: '1fr' },
    gap: { default: 12, [media.mobile]: 2 }
  },
  term: { color: tokens.muted, fontSize: 14 },
  value: { margin: 0, overflowWrap: 'anywhere' },
  lines: { whiteSpace: 'pre-line' },
  actions: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  footer: {
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    paddingTop: 20
  },
  remove: { color: '#ad3e4e' },
  confirm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    backgroundColor: '#fff5f5',
    padding: 16,
    borderRadius: 10
  }
});
