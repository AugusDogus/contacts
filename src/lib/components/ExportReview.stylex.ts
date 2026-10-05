import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
export const styles = stylex.create({
  lead: { fontSize: 14, color: tokens.muted },
  people: {
    listStyle: 'none',
    margin: 0,
    marginTop: 16,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxHeight: 'min(60dvh, 520px)',
    overflowY: 'auto'
  },
  person: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 10,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  name: { fontWeight: 600 },
  choice: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 500, color: tokens.muted },
  values: {
    margin: 0,
    display: 'grid',
    gridTemplateColumns: { default: '1fr 1fr', [media.mobile]: '1fr' },
    gap: 8
  },
  value: {
    paddingBlock: 8,
    paddingInline: 10,
    borderRadius: 8,
    backgroundColor: tokens.surface,
    transition: 'opacity 150ms ease',
    minWidth: 0
  },
  // The version that will not be kept.
  dropped: { opacity: 0.45 },
  source: { fontSize: 11, fontWeight: 600, letterSpacing: 0.4, color: tokens.faint },
  text: { margin: 0, fontSize: 14, overflowWrap: 'anywhere' },
  options: { alignSelf: 'flex-start' },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16
  },
  summary: { fontSize: 13, color: tokens.muted },
  actions: { display: 'flex', gap: 8, marginLeft: 'auto' }
});
