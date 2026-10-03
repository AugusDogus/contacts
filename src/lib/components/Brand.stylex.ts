import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';
export const styles = stylex.create({
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 9,
    fontFamily: tokens.heading,
    fontSize: 18,
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: -0.4,
    whiteSpace: 'nowrap',
    color: tokens.ink,
    textDecoration: 'none'
  }
});
