import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

export const styles = stylex.create({
  page: {
    maxWidth: 720,
    marginInline: 'auto',
    paddingTop: 32,
    paddingInline: 24,
    paddingBottom: 64
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 48
  },
  content: { display: 'grid', gap: 24, lineHeight: 1.7 },
  section: { display: 'grid', gap: 8 },
  link: { color: tokens.blue, textDecoration: 'underline', textUnderlineOffset: 3 }
});
