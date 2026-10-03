import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '#lib/tokens.stylex.ts';
export const styles = stylex.create({
  appShell: { display: 'flex', minHeight: '100dvh' },
  sidebar: {
    width: { default: 240, [media.compact]: 212, [media.tablet]: 250 },
    position: 'fixed',
    insetBlock: 0,
    left: 0,
    zIndex: 30,
    overflowY: 'auto',
    visibility: { default: 'visible', [media.tablet]: 'hidden' },
    backgroundColor: tokens.paper,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: tokens.line,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 29,
    paddingInline: { default: 20, [media.compact]: 14 },
    transform: { default: 'none', [media.tablet]: 'translateX(-100%)' }
  },
  mobileOpen: { transform: 'none', visibility: 'visible' },
  brandRow: {
    paddingInline: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  workspace: {
    marginTop: 36,
    marginBottom: 27,
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    paddingBlock: 11,
    paddingInline: 9,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 9,
    color: tokens.ink
  },
  workspaceAvatar: {
    width: 30,
    height: 32,
    borderRadius: 7,
    display: 'grid',
    placeItems: 'center',
    color: '#6879bc',
    backgroundColor: '#edf0fb',
    fontFamily: tokens.heading,
    fontSize: 17
  },
  flexText: { flexGrow: 1, minWidth: 0 },
  workspaceTitle: { fontSize: 12, fontWeight: 600, display: 'block' },
  workspaceSubtitle: { color: tokens.muted, fontSize: 10, display: 'block', marginTop: 2 },
  nav: { display: 'flex', flexDirection: 'column', gap: 5 },
  navLink: {
    paddingBlock: 11,
    paddingInline: 13,
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    color: '#737b8b',
    fontSize: 13,
    borderRadius: 7,
    backgroundColor: { default: 'transparent', [media.hover]: { ':hover': '#f7f8fb' } }
  },
  active: {
    backgroundColor: { default: tokens.blueSoft, [media.hover]: { ':hover': tokens.blueSoft } },
    color: tokens.blue,
    fontWeight: 600
  },
  navCount: { fontSize: 11, minWidth: 20, textAlign: 'center' },
  navDivider: {
    marginBlock: 18,
    marginInline: 12,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line
  },
  googleMark: {
    fontFamily: 'Arial,sans-serif',
    fontSize: 20,
    fontWeight: 'bold',
    width: 18,
    color: '#778293'
  },
  sidebarBottom: { marginTop: 'auto', paddingTop: 60 },
  privateNote: { marginInline: 9, marginBottom: 33 },
  shield: { display: 'block', color: '#7c91a0', marginBottom: 9 },
  privateTitle: { fontSize: 12, fontWeight: 500 },
  privateText: { fontSize: 11, color: '#818a99', marginTop: 8, lineHeight: 1.7 },
  privateLink: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
    marginTop: 13,
    fontSize: 11,
    color: '#6c7fa1'
  },
  accountRow: {
    minHeight: 79,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    color: tokens.ink
  },
  accountAvatar: {
    backgroundColor: '#f1eadd',
    color: '#97816a',
    display: 'grid',
    placeItems: 'center',
    width: 33,
    height: 33,
    borderRadius: '50%',
    fontFamily: tokens.heading
  },
  accountSmall: {
    display: 'block',
    fontSize: 10,
    color: tokens.muted,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  mainShell: {
    marginLeft: { default: 240, [media.compact]: 212, [media.tablet]: 0 },
    width: {
      default: 'calc(100% - 240px)',
      [media.compact]: 'calc(100% - 212px)',
      [media.tablet]: '100%'
    },
    display: 'flex',
    flexDirection: 'column'
  },
  topbar: {
    height: { default: 77, [media.tablet]: 62 },
    flexShrink: 0,
    paddingInline: { default: 42, [media.compact]: 28, [media.tablet]: 20 },
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.line,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fdfdfe',
    fontSize: 12
  },
  topbarGroup: { display: 'flex', alignItems: 'center', gap: { default: 15, [media.tablet]: 10 } },
  breadcrumb: { color: '#828c9d', display: { default: 'inline', [media.tablet]: 'none' } },
  slash: { color: '#c4c8d2', display: { default: 'inline', [media.tablet]: 'none' } },
  demoPill: {
    display: { default: 'flex', [media.tablet]: 'none' },
    alignItems: 'center',
    gap: 7,
    color: '#828997',
    fontSize: 11
  },
  demoDot: { width: 6, height: 6, borderRadius: '50%', backgroundColor: '#93a79b' },
  topLink: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 },
  privateLabel: { display: 'flex', gap: 6, alignItems: 'center', color: tokens.muted },
  main: {
    width: '100%',
    maxWidth: 1460,
    paddingTop: { default: 42, [media.compact]: 32, [media.tablet]: 30 },
    paddingBottom: 28,
    paddingInline: { default: 42, [media.compact]: 28, [media.tablet]: 20 },
    marginInline: 'auto',
    flexGrow: 1
  },
  appFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#8992a2',
    paddingBlock: 22,
    paddingInline: { default: 42, [media.tablet]: 20 }
  },
  footerEnd: { display: { default: 'flex', [media.tablet]: 'none' }, alignItems: 'center', gap: 8 },
  footerSpark: { color: '#9ba8d9', fontSize: 17 },
  mobileButton: { display: { default: 'none', [media.tablet]: 'inline-flex' } },
  mobileScrim: {
    position: 'fixed',
    inset: 0,
    zIndex: 25,
    backgroundColor: '#27314550',
    borderWidth: 0
  },
  skipLink: {
    position: 'fixed',
    left: { default: 260, [media.tablet]: 20 },
    top: { default: -100, ':focus': 10 },
    zIndex: 90,
    backgroundColor: tokens.blue,
    color: tokens.paper,
    padding: 10
  }
});
