import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  filters: { marginBottom: 14, width: 'fit-content' },
  list: { listStyle: 'none', margin: 0, padding: 0 },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingBlock: 12,
    paddingInline: { default: 20, [media.mobile]: 16 },
    borderBottomWidth: { default: 1, ':last-child': 0 },
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.line,
    flexWrap: { default: 'nowrap', [media.mobile]: 'wrap' }
  },
  details: { flexGrow: 1, minWidth: 0, flexBasis: { default: 'auto', [media.mobile]: '100%' } },
  label: { fontWeight: 500, overflowWrap: 'anywhere' },
  reference: { color: tokens.muted, fontWeight: 400, fontSize: 14, marginLeft: 4 },
  meta: { fontSize: 14, color: tokens.muted, marginTop: 2 },
  footnote: { fontSize: 14, color: tokens.muted, marginTop: 16, maxWidth: 620 }
});
