import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  container: { maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 24 },
  section: { padding: { default: 28, [media.mobile]: 22 } },
  sectionTitle: { fontSize: 20, marginBottom: 12 },
  description: { fontSize: 13, color: tokens.muted, lineHeight: 1.8, marginBottom: 20 },
  row: { display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 },
  contactName: { fontWeight: 500, fontSize: 15 },
  email: { fontSize: 12, color: tokens.muted, marginTop: 4 },
  actions: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  claim: { backgroundColor: tokens.blueSoft, borderRadius: 12, padding: 24 },
  note: { color: tokens.muted, fontSize: 11, marginTop: 17 }
});
