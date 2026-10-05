import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
export const styles = stylex.create({
  field: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 },
  wide: { gridColumn: { default: '1 / -1', [media.mobile]: 'auto' } },
  stretchOnMobile: { gridColumn: { default: 'auto', [media.mobile]: '1 / -1' } },
  label: { display: 'flex', alignItems: 'baseline', gap: 6 },
  required: { fontSize: 12, fontWeight: 400, color: tokens.faint },
  error: { fontSize: 13, color: tokens.danger }
});
