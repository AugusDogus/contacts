import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  actions: { display: 'flex', gap: 8 },
  wideOnly: { display: { default: 'inline', [media.mobile]: 'none' } },
  quiet: {
    color: tokens.muted,
    fontSize: 14,
    textAlign: 'center',
    textWrap: 'balance',
    paddingBlock: 24
  },
  sectionTitle: {
    fontFamily: tokens.font,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0,
    color: tokens.muted,
    marginBottom: 8
  },
  new: { color: tokens.blue, backgroundColor: tokens.blueSoft, paddingBlock: 0, paddingInline: 7 },
  birthdays: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    overflowX: 'auto'
  },
  birthdaysTitle: {
    fontFamily: tokens.font,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: 0,
    color: tokens.muted,
    flexShrink: 0
  },
  birthdayList: {
    display: 'flex',
    gap: 6,
    listStyle: 'none',
    margin: 0,
    padding: 0
  },
  birthday: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    paddingBlock: 3,
    paddingLeft: 3,
    paddingRight: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    backgroundColor: { default: tokens.paper, [media.hover]: { ':hover': tokens.hover } },
    color: tokens.ink,
    fontSize: 13,
    whiteSpace: 'nowrap'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    height: 38,
    paddingInline: 11,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: tokens.field, ':focus-within': tokens.blue },
    borderRadius: 8,
    backgroundColor: tokens.paper,
    color: tokens.faint,
    fontWeight: 400,
    outline: { default: 'none', ':focus-within': `3px solid ${tokens.blueSoft}` },
    outlineOffset: 0
  },
  searchInput: {
    flexGrow: 1,
    minWidth: 0,
    height: '100%',
    borderWidth: 0,
    padding: 0,
    backgroundColor: 'transparent',
    color: tokens.ink,
    outline: 'none'
  },
  list: { listStyle: 'none', margin: 0, padding: 0 },
  item: {
    borderBottomWidth: { default: 1, ':last-child': 0 },
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.line
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingBlock: 10,
    paddingInline: { default: 16, [media.mobile]: 14 },
    borderWidth: 0,
    textAlign: 'left',
    color: tokens.ink,
    backgroundColor: { default: 'transparent', [media.hover]: { ':hover': tokens.surface } },
    transition: 'background-color 120ms ease'
  },
  who: { display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, lineHeight: 1.35 },
  name: { display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: tokens.ink },
  secondary: {
    fontSize: 13,
    color: tokens.muted,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  place: {
    display: { default: 'block', [media.mobile]: 'none' },
    fontSize: 13,
    color: tokens.faint,
    whiteSpace: 'nowrap'
  }
});
