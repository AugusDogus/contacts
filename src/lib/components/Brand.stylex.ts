import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';
export const styles = stylex.create({
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontFamily: tokens.heading,
    fontSize: 21,
    lineHeight: 1.05,
    fontWeight: 700,
    letterSpacing: -0.6,
    color: tokens.ink,
    textDecoration: 'none'
  }
});
