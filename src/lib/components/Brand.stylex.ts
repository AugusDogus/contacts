import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';
export const styles = stylex.create({
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: tokens.heading,
    fontSize: 16,
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: -0.3,
    whiteSpace: 'nowrap',
    color: tokens.ink,
    textDecoration: 'none'
  }
});
