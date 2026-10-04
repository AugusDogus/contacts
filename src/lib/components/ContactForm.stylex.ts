import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
export const styles = stylex.create({
  form: { display: 'flex', flexDirection: 'column', gap: 24 },
  photoRow: { display: 'flex', alignItems: 'center', gap: 14 },
  photoPick: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    cursor: 'pointer',
    borderRadius: 999,
    color: tokens.blue,
    fontWeight: 500,
    outline: { default: 'none', ':has(:focus-visible)': `2px solid ${tokens.blue}` },
    outlineOffset: 4
  },
  photoPlaceholder: {
    width: 56,
    height: 56,
    flexShrink: 0,
    backgroundColor: { default: tokens.surface, [media.hover]: { ':hover': tokens.hover } },
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cdd1d8',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: tokens.muted,
    transition: 'background-color 150ms ease'
  },
  photoText: { fontSize: 14 },
  photoRemove: { color: tokens.muted, fontSize: 14 },
  section: { borderWidth: 0, margin: 0, padding: 0, minWidth: 0 },
  sectionTitle: {
    padding: 0,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: tokens.faint
  },
  submit: { display: 'flex', flexDirection: 'column', gap: 10 },
  saveNote: { color: tokens.muted, fontSize: 13, textAlign: 'center' }
});
