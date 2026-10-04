import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
export const styles = stylex.create({
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    padding: { default: 18, [media.mobile]: 14 },
    overflow: 'visible'
  },
  label: { fontSize: 14, fontWeight: 500, color: '#3b4252' },
  help: { fontSize: 13, color: tokens.muted, marginTop: 2 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    paddingBlock: 5,
    paddingInline: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: tokens.field, [media.hover]: { ':hover': '#c9cdd5' } },
    backgroundColor: tokens.paper,
    color: tokens.ink,
    fontSize: 13,
    fontWeight: 500,
    transition: `transform 140ms ${tokens.easeOut}, background-color 150ms ease`,
    transform: { default: 'none', ':active': 'scale(.96)', [media.reducedMotion]: 'none' }
  },
  chipOn: {
    backgroundColor: tokens.ink,
    borderColor: tokens.ink,
    color: tokens.paper
  },
  customList: {
    listStyle: 'none',
    margin: 0,
    marginTop: 8,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  customRow: { display: 'flex', alignItems: 'center', gap: 10 },
  customInput: { marginTop: 0, flexGrow: 1, minWidth: 0 },
  check: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 400,
    color: tokens.muted,
    whiteSpace: 'nowrap',
    accentColor: tokens.ink
  },
  add: { display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, fontSize: 14 }
});
