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
  required: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: 400,
    letterSpacing: 0,
    textTransform: 'none',
    color: tokens.faint
  },
  control: { marginTop: 0 },
  select: {
    appearance: 'none',
    paddingRight: 36,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    cursor: 'pointer'
  },
  placeholder: { color: tokens.faint },
  localityRow: {
    gridColumn: { default: '1 / -1', [media.mobile]: 'auto' },
    display: 'grid',
    gridTemplateColumns: { default: '2fr 1.2fr 1fr', [media.mobile]: '1fr 1fr' },
    gap: 14
  },
  hint: { fontSize: 13, color: tokens.muted },
  photoMissing: { borderColor: tokens.danger },
  photoError: { display: 'block', fontSize: 13, fontWeight: 400, color: tokens.danger },
  submit: { display: 'flex', flexDirection: 'column', gap: 10 },
  saveNote: { color: tokens.muted, fontSize: 13, textAlign: 'center', textWrap: 'balance' }
});
