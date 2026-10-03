import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  shell: {
    minHeight: '100dvh',
    display: 'grid',
    gridTemplateColumns: { default: '1fr 1fr', [media.tablet]: '1fr' }
  },
  story: {
    backgroundColor: '#eaf0fc',
    padding: { default: 60, [media.tablet]: 28 },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: { default: '100dvh', [media.tablet]: 'auto' }
  },
  storyBody: { maxWidth: 470, marginBlock: 55 },
  title: {
    fontSize: { default: 58, [media.tablet]: 40 },
    lineHeight: 1.05,
    color: '#3f5480',
    letterSpacing: -2
  },
  storyText: { maxWidth: 350, color: '#7c8dad', marginTop: 25, lineHeight: 1.9, fontSize: 15 },
  art: { marginTop: 35, display: { default: 'block', [media.tablet]: 'none' } },
  storyFooter: { fontSize: 12, color: '#8092b6', display: 'flex', alignItems: 'center', gap: 7 },
  formSide: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBlock: 50,
    paddingInline: 25,
    backgroundColor: tokens.paper
  },
  form: { width: '100%', maxWidth: 360 },
  formTitle: { fontSize: 30, marginBottom: 10 },
  formIntro: { color: tokens.muted, fontSize: 13, marginBottom: 28 },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 15,
    fontSize: 11,
    color: '#a0a9b8',
    marginBlock: 23,
    '::before': { content: '""', height: 1, backgroundColor: tokens.line, flexGrow: 1 },
    '::after': { content: '""', height: 1, backgroundColor: tokens.line, flexGrow: 1 }
  },
  toggle: { textAlign: 'center', marginTop: 25, color: tokens.muted, fontSize: 12 },
  toggleButton: {
    borderWidth: 0,
    color: tokens.blue,
    padding: 0,
    backgroundColor: 'transparent',
    fontSize: 12,
    fontWeight: 500
  },
  googleLetter: { color: '#4c7fcf', fontFamily: 'Arial,sans-serif', fontSize: 18 },
  disclaimer: {
    fontSize: 11,
    color: '#7e8c9f',
    lineHeight: 1.8,
    marginTop: 23,
    textAlign: 'center'
  }
});
