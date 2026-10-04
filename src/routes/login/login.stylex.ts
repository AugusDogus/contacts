import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  shell: {
    minHeight: '100dvh',
    paddingTop: { default: 24, [media.mobile]: 16 },
    paddingInline: { default: 24, [media.mobile]: 16 },
    backgroundColor: tokens.surface,
    display: 'flex',
    flexDirection: 'column'
  },
  header: { width: '100%', maxWidth: 880, marginInline: 'auto' },
  main: {
    width: '100%',
    maxWidth: 360,
    marginInline: 'auto',
    flexGrow: 1,
    paddingTop: { default: 48, [media.mobile]: 24 }
  },
  art: { display: 'flex', justifyContent: 'center', marginBottom: 16 },
  title: { textAlign: 'center', fontSize: 24 },
  intro: { color: tokens.muted, textAlign: 'center', textWrap: 'balance', marginTop: 6 },
  methods: { marginTop: 24 },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 13,
    color: tokens.faint,
    marginBlock: 16,
    '::before': { content: '""', height: 1, backgroundColor: tokens.line, flexGrow: 1 },
    '::after': { content: '""', height: 1, backgroundColor: tokens.line, flexGrow: 1 }
  },
  toggle: { textAlign: 'center', marginTop: 20, color: tokens.muted, fontSize: 14 }
});
