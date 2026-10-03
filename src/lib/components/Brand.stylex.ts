import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';
export const styles = stylex.create({
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontFamily: tokens.heading,
    fontSize: 29,
    fontWeight: 700,
    letterSpacing: -1.1,
    color: tokens.ink,
    textDecoration: 'none'
  },
  brandDot: { color: tokens.blue }
});
