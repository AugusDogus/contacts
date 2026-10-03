import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
export const styles = stylex.create({
  shell: {
    minHeight: '100dvh',
    paddingTop: { default: 28, [media.mobile]: 20 },
    paddingInline: { default: 32, [media.mobile]: 16 },
    paddingBottom: 48,
    backgroundColor: tokens.surface
  },
  header: {
    maxWidth: 1040,
    marginInline: 'auto',
    marginBottom: { default: 48, [media.mobile]: 32 }
  },
  content: { width: '100%', maxWidth: 600, marginInline: 'auto' },
  intro: { textAlign: 'center', marginBottom: 28 },
  avatar: {
    display: 'grid',
    placeItems: 'center',
    width: 56,
    height: 56,
    borderRadius: '50%',
    backgroundColor: tokens.blueSoft,
    color: tokens.blue,
    fontFamily: tokens.heading,
    fontSize: 24,
    fontWeight: 600,
    marginInline: 'auto',
    marginBottom: 16
  },
  title: { fontSize: { default: 30, [media.mobile]: 25 }, overflowWrap: 'anywhere' },
  message: {
    maxWidth: 460,
    marginTop: 12,
    marginInline: 'auto',
    color: tokens.muted,
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-line'
  },
  card: {
    backgroundColor: tokens.paper,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 16,
    padding: { default: 32, [media.mobile]: 20 }
  },
  footer: { marginTop: 20, textAlign: 'center', fontSize: 13, color: tokens.muted },
  closed: {
    paddingBlock: 12,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14
  },
  closedText: { maxWidth: 400, color: tokens.muted }
});
