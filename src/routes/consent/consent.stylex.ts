import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  main: { maxWidth: 420 },
  card: { padding: { default: 28, [media.mobile]: 20 } },
  host: { color: tokens.muted, textAlign: 'center', fontSize: 14, marginTop: 6 },
  account: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    paddingBlock: 12,
    paddingInline: 14,
    borderRadius: 10,
    backgroundColor: tokens.surface
  },
  accountText: { minWidth: 0, lineHeight: 1.35 },
  accountName: { fontWeight: 500, overflowWrap: 'anywhere' },
  accountEmail: { fontSize: 13, color: tokens.muted, overflowWrap: 'anywhere' },
  lead: { marginTop: 24, fontWeight: 500 },
  scopes: {
    marginTop: 10,
    paddingLeft: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  actions: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }
});
