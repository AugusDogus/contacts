import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
export const styles = stylex.create({
  shell: {
    minHeight: '100dvh',
    paddingTop: { default: 24, [media.mobile]: 16 },
    paddingInline: { default: 24, [media.mobile]: 12 },
    backgroundColor: tokens.surface,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    width: '100%',
    maxWidth: 880,
    marginInline: 'auto',
    marginBottom: { default: 40, [media.mobile]: 28 },
    paddingInline: { default: 0, [media.mobile]: 4 }
  },
  content: { width: '100%', maxWidth: 560, marginInline: 'auto', flexGrow: 1 },
  intro: { textAlign: 'center', marginBottom: 24, paddingInline: 8 },
  avatar: {
    display: 'grid',
    placeItems: 'center',
    width: 52,
    height: 52,
    borderRadius: '50%',
    backgroundColor: tokens.blueSoft,
    color: tokens.blue,
    fontFamily: tokens.heading,
    fontSize: 22,
    fontWeight: 600,
    marginInline: 'auto',
    marginBottom: 14
  },
  title: { fontSize: { default: 26, [media.mobile]: 22 }, overflowWrap: 'anywhere' },
  message: {
    maxWidth: 440,
    marginTop: 8,
    marginInline: 'auto',
    color: tokens.muted,
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-line',
    textWrap: 'balance'
  },
  card: {
    backgroundColor: tokens.paper,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 14,
    padding: { default: 28, [media.mobile]: 18 },
    boxShadow: '0 1px 2px #1e23300a'
  },
  closed: {
    paddingBlock: 8,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14
  },
  closedText: { maxWidth: 380, color: tokens.muted, textWrap: 'balance' },
  pitchTitle: { fontSize: 17 },
  signIn: { fontSize: 13, color: tokens.muted }
});
