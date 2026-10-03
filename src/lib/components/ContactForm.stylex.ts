import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';
export const styles = stylex.create({
  form: { display: 'flex', flexDirection: 'column', gap: 24 },
  photoRow: { display: 'flex', alignItems: 'center', gap: 16 },
  photoPlaceholder: {
    width: 64,
    height: 64,
    flexShrink: 0,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cfd5e2',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: tokens.muted
  },
  photoLabel: { display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 6 },
  file: {
    width: '100%',
    maxWidth: 260,
    fontSize: 13,
    color: tokens.muted,
    '::file-selector-button': {
      borderWidth: 0,
      borderRadius: 6,
      paddingBlock: 6,
      paddingInline: 10,
      backgroundColor: tokens.blueSoft,
      color: tokens.blue,
      cursor: 'pointer',
      marginRight: 10
    }
  },
  hint: { fontSize: 13, color: tokens.muted, marginTop: -10 },
  section: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    paddingTop: 22
  },
  sectionTitle: { marginBottom: 14 },
  optional: { fontSize: 13, fontWeight: 400, color: tokens.muted },
  summary: { fontSize: 14, color: tokens.blue, cursor: 'pointer', marginBottom: 16 },
  consent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: 14,
    color: tokens.muted,
    fontWeight: 400
  },
  consentCheck: { marginTop: 3 },
  saveNote: { color: tokens.muted, fontSize: 13, textAlign: 'center', marginTop: -12 }
});
