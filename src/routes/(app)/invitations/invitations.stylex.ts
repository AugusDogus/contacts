import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  explanation: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 13,
    backgroundColor: tokens.blueSoft,
    borderRadius: 10,
    padding: 20,
    color: '#6275a3',
    marginBottom: 28,
    fontSize: 13
  },
  explanationText: { maxWidth: 650 },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.line
  },
  filter: { width: 155, marginTop: 0, minHeight: 38, fontSize: 12 },
  list: { display: 'flex', flexDirection: 'column' },
  row: {
    paddingBlock: 20,
    paddingInline: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.line,
    flexWrap: { default: 'nowrap', [media.mobile]: 'wrap' }
  },
  icon: {
    width: 39,
    height: 39,
    borderRadius: 10,
    backgroundColor: '#f3f5fa',
    color: '#8a98b7',
    display: 'grid',
    placeItems: 'center'
  },
  details: { flexGrow: 1, minWidth: 160 },
  label: { fontSize: 13, fontWeight: 500 },
  meta: { fontSize: 11, color: tokens.muted, marginTop: 4 },
  state: { display: 'flex', alignItems: 'center', gap: 14 },
  footnote: { fontSize: 12, color: tokens.muted, marginTop: 20, lineHeight: 1.8 }
});
