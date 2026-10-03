import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  stack: { maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 },
  section: { padding: { default: 28, [media.mobile]: 20 } },
  title: { marginBottom: 6 },
  text: { color: tokens.muted, marginBottom: 18 },
  fine: { fontSize: 13, color: tokens.muted, marginTop: 12 },
  claim: { backgroundColor: tokens.blueSoft, borderRadius: 13, padding: 24 },
  address: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 7,
    paddingRight: 13,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#dfe3eb',
    borderRadius: 8,
    backgroundColor: tokens.paper,
    outline: { default: 'none', ':focus-within': '3px solid #7b97ee' },
    outlineOffset: 3
  },
  slugInput: {
    flexGrow: 1,
    minWidth: 60,
    minHeight: 44,
    paddingBlock: 11,
    paddingLeft: 13,
    paddingRight: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: tokens.ink,
    outline: 'none'
  },
  suffix: { color: tokens.muted, fontWeight: 400, whiteSpace: 'nowrap' },
  formFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap'
  },
  share: { display: 'flex', alignItems: 'center', gap: 18, fontSize: 14 },
  copy: { display: 'inline-flex', alignItems: 'center', gap: 6 },
  card: { display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 },
  cardName: { fontWeight: 500 }
});
