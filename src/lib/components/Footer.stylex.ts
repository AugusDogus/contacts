import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
export const styles = stylex.create({
  footer: {
    width: '100%',
    maxWidth: 880,
    marginInline: 'auto',
    marginTop: 48,
    paddingBlock: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: { default: 'space-between', [media.mobile]: 'center' },
    flexWrap: 'wrap',
    gap: { default: 16, [media.mobile]: 10 },
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    fontSize: 13,
    color: tokens.faint
  },
  links: { display: 'flex', gap: 20 },
  link: { color: { default: tokens.muted, [media.hover]: { ':hover': tokens.ink } } }
});
