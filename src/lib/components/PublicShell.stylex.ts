import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
export const styles = stylex.create({
  shell: {
    minHeight: '100dvh',
    paddingTop: 30,
    paddingInline: { default: 30, [media.mobile]: 18 },
    paddingBottom: 36,
    backgroundColor: '#f5f7fc'
  },
  header: {
    maxWidth: 1080,
    marginInline: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 38
  },
  label: { fontSize: 12, color: '#8995ad' },
  content: { width: '100%', maxWidth: 640, marginInline: 'auto' },
  intro: { textAlign: 'center', marginBottom: 27 },
  avatar: {
    display: 'grid',
    placeItems: 'center',
    width: 57,
    height: 57,
    borderRadius: 18,
    backgroundColor: '#e2e9fc',
    color: '#6d80b7',
    fontFamily: tokens.heading,
    fontSize: 25,
    marginInline: 'auto',
    marginBottom: 18
  },
  from: { fontSize: 12, color: '#8190ac', marginBottom: 12 },
  title: { fontSize: { default: 36, [media.mobile]: 30 } },
  message: {
    maxWidth: 430,
    marginInline: 'auto',
    marginTop: 14,
    color: tokens.muted,
    fontSize: 14,
    lineHeight: 1.8,
    overflowWrap: 'anywhere'
  },
  card: {
    backgroundColor: tokens.paper,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 17,
    padding: { default: 32, [media.mobile]: 22 },
    boxShadow: '0 5px 30px #38487104'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontSize: 11,
    color: '#8895a9',
    marginTop: 25
  },
  closed: {
    paddingBlock: 25,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 18
  },
  closedText: { maxWidth: 380, color: tokens.muted, fontSize: 14, lineHeight: 1.8 }
});
