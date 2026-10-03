import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  shell: {
    minHeight: '100dvh',
    paddingTop: { default: 28, [media.mobile]: 20 },
    paddingInline: { default: 32, [media.mobile]: 20 },
    paddingBottom: 48,
    backgroundColor: tokens.paper
  },
  header: { maxWidth: 1040, marginInline: 'auto' },
  main: {
    width: '100%',
    maxWidth: 380,
    marginInline: 'auto',
    paddingTop: { default: 40, [media.mobile]: 24 }
  },
  art: { display: 'flex', justifyContent: 'center', marginBottom: 20 },
  title: { textAlign: 'center' },
  intro: { color: tokens.muted, textAlign: 'center', marginTop: 8, marginBottom: 28 },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    fontSize: 13,
    color: tokens.muted,
    marginBlock: 20,
    '::before': { content: '""', height: 1, backgroundColor: tokens.line, flexGrow: 1 },
    '::after': { content: '""', height: 1, backgroundColor: tokens.line, flexGrow: 1 }
  },
  toggle: { textAlign: 'center', marginTop: 24, color: tokens.muted, fontSize: 14 },
  privacy: { textAlign: 'center', marginTop: 32, fontSize: 13 },
  googleLetter: { color: '#4c7fcf', fontFamily: 'Arial, sans-serif', fontSize: 18 }
});
