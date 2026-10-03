import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';
export const styles = stylex.create({
  form: { display: 'flex', flexDirection: 'column', gap: 25 },
  photoRow: { display: 'flex', alignItems: 'center', gap: 17, marginBottom: 3 },
  photoPlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: '#f0f3fb',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccd5e8',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: '#97a5be'
  },
  photoLabel: {
    cursor: 'pointer',
    display: 'inline-flex',
    color: tokens.blue,
    fontSize: 12,
    alignItems: 'center',
    gap: 6
  },
  file: {
    width: '100%',
    maxWidth: 260,
    fontSize: 11,
    color: tokens.muted,
    '::file-selector-button': {
      borderWidth: 0,
      borderRadius: 5,
      paddingBlock: 5,
      paddingInline: 9,
      backgroundColor: tokens.blueSoft,
      color: tokens.blue,
      cursor: 'pointer',
      marginRight: 8
    }
  },
  photoHelp: { fontSize: 10, color: tokens.muted, marginTop: 7 },
  section: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    paddingTop: 23
  },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 17 },
  sectionTitle: { fontSize: 17 },
  optional: {
    fontFamily: tokens.font,
    fontSize: 11,
    fontWeight: 400,
    color: tokens.muted,
    letterSpacing: 0
  },
  summary: { fontSize: 13, color: '#6d7b96', cursor: 'pointer', marginBottom: 18 },
  consent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: 12,
    color: tokens.muted,
    fontWeight: 400,
    lineHeight: 1.7
  },
  consentCheck: { marginTop: 3 },
  saveNote: { color: tokens.muted, fontSize: 11, textAlign: 'center', marginTop: -13 }
});
