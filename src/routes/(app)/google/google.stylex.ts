import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  stack: { maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 },
  section: { padding: { default: 28, [media.mobile]: 20 } },
  heading: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  text: { color: tokens.muted, marginBottom: 18, maxWidth: 560 },
  actions: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  after: { marginTop: 18 },
  fine: { fontSize: 13, color: tokens.muted, marginTop: 18 },
  uncertain: {
    marginTop: 18,
    fontSize: 14,
    color: '#7a5d22',
    backgroundColor: '#fff9ec',
    padding: 16,
    borderRadius: 8
  },
  uncertainList: { paddingLeft: 20, marginTop: 8, marginBottom: 0 }
});
