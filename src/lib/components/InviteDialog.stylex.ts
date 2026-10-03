import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';
export const styles = stylex.create({
  form: { marginTop: 22, display: 'flex', flexDirection: 'column', gap: 18 },
  optional: { color: tokens.muted, fontWeight: 400, marginLeft: 4 },
  severalToggle: { alignSelf: 'flex-start', fontSize: 14 },
  countRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    fontSize: 14,
    fontWeight: 500
  },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#dfe3eb',
    borderRadius: 8
  },
  step: {
    width: 36,
    height: 40,
    borderWidth: 0,
    backgroundColor: 'transparent',
    display: 'grid',
    placeItems: 'center',
    color: tokens.muted
  },
  stepInput: {
    width: 44,
    height: 40,
    padding: 0,
    borderWidth: 0,
    textAlign: 'center',
    color: tokens.ink,
    backgroundColor: 'transparent',
    appearance: 'textfield',
    '::-webkit-inner-spin-button': { appearance: 'none' }
  },
  fine: { fontSize: 13, color: tokens.muted, textAlign: 'center' },
  links: {
    maxHeight: 320,
    overflow: 'auto',
    listStyle: 'none',
    marginTop: 20,
    marginBottom: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    backgroundColor: tokens.surface,
    paddingBlock: 10,
    paddingInline: 12,
    borderRadius: 8
  },
  linkText: { flexGrow: 1, minWidth: 0 },
  linkLabel: { display: 'block', fontSize: 13, fontWeight: 500 },
  linkInput: {
    width: '100%',
    fontSize: 14,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: tokens.ink,
    textOverflow: 'ellipsis'
  },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }
});
