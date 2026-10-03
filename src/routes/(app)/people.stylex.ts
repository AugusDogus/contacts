import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  start: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 14,
    paddingBlock: { default: 56, [media.mobile]: 40 },
    paddingInline: 24
  },
  startActions: { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  birthdays: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 20
  },
  birthdaysTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontFamily: tokens.font,
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: 0,
    color: tokens.muted
  },
  birthdayList: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    listStyle: 'none',
    margin: 0,
    padding: 0
  },
  birthday: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingBlock: 4,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    backgroundColor: { default: tokens.paper, [media.hover]: { ':hover': tokens.surface } },
    color: tokens.ink,
    fontSize: 14
  },
  toolbar: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 0,
    height: 42,
    paddingInline: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#dfe3eb',
    borderRadius: 8,
    backgroundColor: tokens.paper,
    color: tokens.muted,
    fontWeight: 400,
    outline: { default: 'none', ':focus-within': '3px solid #7b97ee' },
    outlineOffset: 2
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
  sort: { display: 'flex' },
  sortSelect: {
    height: 42,
    paddingInline: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#dfe3eb',
    borderRadius: 8,
    backgroundColor: tokens.paper,
    color: tokens.ink
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
    gap: 14,
    width: '100%',
    paddingBlock: 12,
    paddingInline: { default: 20, [media.mobile]: 16 },
    borderWidth: 0,
    textAlign: 'left',
    color: tokens.ink,
    backgroundColor: { default: 'transparent', [media.hover]: { ':hover': tokens.surface } }
  },
  who: { display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 },
  name: { display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: tokens.ink },
  favorite: { color: '#c09a3b' },
  secondary: {
    fontSize: 14,
    color: tokens.muted,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  place: {
    display: { default: 'block', [media.mobile]: 'none' },
    fontSize: 14,
    color: tokens.muted,
    whiteSpace: 'nowrap'
  },
  footnote: { marginTop: 16, fontSize: 14, color: tokens.muted }
});
