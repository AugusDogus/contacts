import * as stylex from '@stylexjs/stylex';
import { tokens } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  host: { color: tokens.muted, textAlign: 'center', fontSize: 14, marginTop: 6 },
  scopes: {
    marginTop: 24,
    paddingLeft: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  account: { color: tokens.muted, fontSize: 14, marginTop: 20 },
  actions: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }
});
