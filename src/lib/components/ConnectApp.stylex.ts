import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  connect: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    paddingBlock: { default: 18, [media.mobile]: 16 },
    paddingInline: { default: 16, [media.mobile]: 14 },
    // Separates it from connected apps listed above it in the same panel.
    borderTopWidth: { default: 1, ':first-child': 0 },
    borderTopStyle: 'solid',
    borderTopColor: tokens.line
  },
  title: { fontWeight: 500 },
  detail: { fontSize: 13, color: tokens.muted },
  targets: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  targetOn: { borderColor: tokens.blue, color: tokens.blue },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginTop: 12,
    marginBottom: 0,
    fontSize: 13,
    color: tokens.ink,
    backgroundColor: tokens.blueSoft,
    borderRadius: 8,
    paddingBlock: 10,
    paddingLeft: 30,
    paddingRight: 12,
    listStyleType: 'decimal'
  },
  external: { verticalAlign: '-2px', marginLeft: 2 },
  other: { marginTop: 16 },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    backgroundColor: tokens.surface,
    paddingBlock: 6,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: 8
  },
  url: {
    flexGrow: 1,
    minWidth: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontSize: 14,
    color: tokens.ink,
    textOverflow: 'ellipsis',
    outline: 'none'
  }
});
