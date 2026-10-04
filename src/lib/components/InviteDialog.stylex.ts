import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';
export const styles = stylex.create({
  lead: { color: tokens.muted, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  optional: { color: tokens.faint, fontWeight: 400, marginLeft: 2 },
  countRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    fontSize: 14,
    fontWeight: 500,
    color: '#3b4252'
  },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.field,
    borderRadius: 8
  },
  step: {
    width: 34,
    height: 36,
    borderWidth: 0,
    backgroundColor: 'transparent',
    display: 'grid',
    placeItems: 'center',
    color: tokens.muted
  },
  stepInput: {
    width: 36,
    height: 36,
    padding: 0,
    borderWidth: 0,
    textAlign: 'center',
    color: tokens.ink,
    backgroundColor: 'transparent',
    fontVariantNumeric: 'tabular-nums',
    appearance: 'textfield',
    '::-webkit-inner-spin-button': { appearance: 'none' }
  },
  links: {
    maxHeight: 320,
    overflow: 'auto',
    listStyle: 'none',
    marginTop: 14,
    marginBottom: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    backgroundColor: tokens.surface,
    paddingBlock: 8,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 8
  },
  linkText: { flexGrow: 1, minWidth: 0 },
  linkLabel: { display: 'block', fontSize: 12, fontWeight: 500, color: tokens.muted },
  linkInput: {
    width: '100%',
    fontSize: 14,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: tokens.ink,
    textOverflow: 'ellipsis',
    outline: 'none'
  },
  actions: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }
});
