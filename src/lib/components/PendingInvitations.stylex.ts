import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
export const styles = stylex.create({
  section: { marginBottom: 28 },
  title: {
    fontFamily: tokens.font,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0,
    color: tokens.muted,
    marginBottom: 8
  },
  list: { listStyle: 'none', margin: 0, padding: 0 },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minHeight: 54,
    paddingBlock: 8,
    paddingLeft: { default: 16, [media.mobile]: 14 },
    paddingRight: { default: 10, [media.mobile]: 8 },
    borderBottomWidth: { default: 1, ':last-child': 0 },
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.line
  },
  text: { flexGrow: 1, minWidth: 0, lineHeight: 1.35 },
  label: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: { default: tokens.ink, [media.hover]: { ':hover': tokens.blue } },
    fontWeight: 500,
    textAlign: 'left',
    overflowWrap: 'anywhere'
  },
  pencil: { display: 'flex', color: tokens.faint },
  reference: { color: tokens.faint, fontWeight: 400, fontSize: 13 },
  unnamed: { fontVariantNumeric: 'tabular-nums' },
  rename: {
    width: '100%',
    maxWidth: 280,
    paddingBlock: 2,
    paddingInline: 6,
    marginLeft: -7,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.blue,
    borderRadius: 6,
    color: tokens.ink,
    fontWeight: 500,
    outline: `3px solid ${tokens.blueSoft}`
  },
  meta: { fontSize: 13, color: tokens.muted },
  expired: { color: '#8a6417' },
  actions: { display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 },
  more: { marginTop: 8, fontSize: 14 }
});
