/* Hallmark · shape: Feature Stack · genre: editorial · theme: Ink (deal 3/3, seed public-homepage-contacts-exchange-6d80·90dc9527·2026-11-06·r0) · job: sign up · draw: 7b5d5a
 * hero: Corridor · nav: floating pill · footer: mast · imagery: the product · signature: the product at work, live, the friend's own form filled in · ink: paper
 * axes: light/grotesk-sans/chromatic-blue · posture: restrained · contrast: pass · fold: pass · v2.0.0 */
/* Hallmark · pre-emit critique: P4 H4 E4 S3 R4 V4 · weakest: S, a type-only hero; the pinned run's first step shows above the fold */
/* waive 22 · ink and greys at zero chroma · a notice board is printed in plain black */
/* waive 48 · StyleX compiles landing-tokens.stylex.ts into hashed custom properties; every colour here is a role token */
/* waive 26a · focus-visible and active states live in this StyleX file, which the static tier cannot read beside the .svelte markup */
/* waive 82 · the pinned run is an ordered list of four live steps; no numeral or mark is drawn per item */
/* answered · brand faces (Bricolage Grotesque, Instrument Sans) and brand blue kept over Epilogue and teal, pre-flight preservation */
import * as stylex from '@stylexjs/stylex';
import { ink, at } from './landing-tokens.stylex';

export const s = stylex.create({
  page: {
    minHeight: '100svh',
    backgroundColor: ink.paper,
    color: ink.ink,
    fontFamily: ink.body,
    fontSize: 17,
    lineHeight: 1.55,
    overflowX: 'clip',
    paddingTop: 12
  },
  container: {
    width: '100%',
    maxWidth: ink.container,
    marginInline: 'auto',
    paddingInline: ink.gutter
  },
  skip: {
    position: 'absolute',
    left: 16,
    top: { default: -96, ':focus-visible': 16 },
    zIndex: 500,
    paddingBlock: 8,
    paddingInline: 16,
    borderRadius: ink.radiusControl,
    backgroundColor: ink.ink,
    color: ink.onInk,
    fontWeight: 600
  },

  // Nav: a floating pill.
  navWrap: {
    position: 'sticky',
    top: 12,
    zIndex: 300,
    paddingInline: ink.gutter
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    maxWidth: 1000,
    minHeight: 60,
    marginInline: 'auto',
    paddingBlock: 8,
    paddingInlineStart: 20,
    paddingInlineEnd: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: ink.rule,
    backgroundColor: `color-mix(in oklab, ${ink.paper} 92%, transparent)`,
    backdropFilter: 'blur(10px)'
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    color: ink.ink,
    fontFamily: ink.display,
    fontWeight: 700,
    fontSize: 17,
    letterSpacing: '-0.02em',
    textDecoration: 'none',
    marginInlineEnd: 'auto',
    borderRadius: 8,
    outline: { default: null, ':focus-visible': `2px solid ${ink.focus}` },
    outlineOffset: 4
  },
  navLinks: {
    display: { default: 'flex', [at.stack]: 'none' },
    gap: 4,
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 44,
    paddingInline: 16,
    borderRadius: 999,
    color: ink.ink2,
    fontWeight: 600,
    fontSize: 15,
    textDecoration: 'none',
    backgroundColor: { default: 'transparent', [at.hover]: { ':hover': ink.paper2 } },
    transition: `background-color ${ink.durShort} ${ink.easeOut}`,
    outline: { default: null, ':focus-visible': `2px solid ${ink.focus}` },
    outlineOffset: 2
  },
  navSignIn: {
    display: { default: 'inline-flex', [at.phone]: 'none' }
  },

  // Buttons: one filled primary style, one quiet.
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    paddingInline: 24,
    borderRadius: ink.radiusControl,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: ink.ink,
    backgroundColor: { default: ink.ink, [at.hover]: { ':hover': ink.ink2 } },
    color: ink.onInk,
    fontFamily: ink.body,
    fontWeight: 600,
    fontSize: 16,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: {
      default: `background-color ${ink.durShort} ${ink.easeOut}, transform ${ink.durMicro} ${ink.easeOut}`,
      [at.reducedMotion]: `background-color ${ink.durShort} linear`
    },
    transform: { default: 'none', ':active': 'translateY(1px)', [at.reducedMotion]: 'none' },
    outline: { default: null, ':focus-visible': `2px solid ${ink.focus}` },
    outlineOffset: 2
  },
  buttonSmall: { minHeight: 44, paddingInline: 20, borderRadius: 999, fontSize: 15 },
  buttonOnInk: {
    borderColor: ink.onInk,
    backgroundColor: { default: ink.onInk, [at.hover]: { ':hover': ink.paper3 } },
    color: ink.ink
  },

  // Hero: Corridor, one centred column.
  hero: {
    display: 'grid',
    placeItems: 'center',
    paddingBlockStart: { default: 'clamp(56px, 10vh, 112px)', [at.stack]: 88 },
    paddingBlockEnd: { default: 'clamp(48px, 8vh, 80px)', [at.stack]: 72 },
    textAlign: 'center'
  },
  heroInner: {
    display: 'grid',
    justifyItems: 'center',
    gap: 28,
    maxWidth: 920
  },
  h1: {
    margin: 0,
    maxWidth: '12ch',
    fontFamily: ink.display,
    fontWeight: 700,
    fontSize: 'clamp(2.75rem, 6.5vw + 1rem, 7.5rem)',
    lineHeight: 0.98,
    letterSpacing: ink.tracking,
    textWrap: 'balance',
    color: ink.ink
  },
  lead: {
    margin: 0,
    maxWidth: '34ch',
    fontSize: ink.textLead,
    lineHeight: 1.45,
    color: ink.ink2,
    textWrap: 'balance'
  },
  heroAction: {
    display: 'grid',
    justifyItems: 'center',
    gap: 16,
    marginTop: 4
  },
  terms: {
    margin: 0,
    fontSize: 15,
    color: ink.muted
  },

  // Sections.
  section: {
    paddingBlock: ink.sectionGap
  },
  // The pinned run follows the hero closely so its first capture shows above the fold.
  sectionAfterHero: {
    paddingBlockStart: 'clamp(24px, 4vw, 56px)'
  },
  band: {
    backgroundColor: ink.paper2,
    borderBlockWidth: 1,
    borderBlockStyle: 'solid',
    borderColor: ink.rule
  },
  h2: {
    margin: 0,
    fontFamily: ink.display,
    fontWeight: 700,
    fontSize: ink.textSection,
    lineHeight: 1.02,
    letterSpacing: ink.tracking,
    textWrap: 'balance',
    maxWidth: '16ch'
  },
  h3: {
    margin: 0,
    fontFamily: ink.display,
    fontWeight: 700,
    fontSize: ink.textTitle,
    lineHeight: 1.15,
    letterSpacing: '-0.02em'
  },
  body: {
    margin: 0,
    maxWidth: '40ch',
    color: ink.ink2,
    textWrap: 'pretty'
  },

  // The pinned run: a sticky pane beside the captures.
  stack: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 5fr) minmax(0, 7fr)', [at.stack]: 'minmax(0, 1fr)' },
    columnGap: 'clamp(32px, 6vw, 96px)',
    rowGap: 48,
    alignItems: 'start'
  },
  pane: {
    position: { default: 'sticky', [at.stack]: 'static' },
    top: 112,
    display: 'grid',
    gap: 24,
    justifyItems: 'start'
  },
  captures: {
    display: 'grid',
    gap: { default: 96, [at.stack]: 56 },
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  figure: {
    display: 'grid',
    gap: 20,
    margin: 0
  },
  shot: {
    display: 'block',
    padding: ink.wellPad,
    borderRadius: ink.radiusCard,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: ink.rule,
    backgroundColor: ink.paper2
  },

  caption: {
    display: 'grid',
    gap: 4,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: ink.ink
  },

  // Fields: a ruled list of what friends fill in.
  split: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 5fr) minmax(0, 7fr)', [at.stack]: 'minmax(0, 1fr)' },
    columnGap: 'clamp(32px, 6vw, 96px)',
    rowGap: 40,
    alignItems: 'start'
  },
  splitHead: { display: 'grid', gap: 20 },
  ruled: {
    display: 'grid',
    gridTemplateColumns: { default: 'repeat(2, minmax(0, 1fr))', [at.phone]: 'minmax(0, 1fr)' },
    columnGap: 32,
    margin: 0,
    padding: 0,
    listStyle: 'none',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: ink.ink
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: ink.rule,
    fontWeight: 600
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 26,
    paddingInline: 12,
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: 'nowrap'
  },
  // Optional and Required switch the demo's form, so they're buttons.
  tagButton: {
    minHeight: 32,
    borderWidth: 0,
    fontFamily: ink.body,
    cursor: 'pointer',
    transition: `background-color ${ink.durMicro} ${ink.easeOut}, color ${ink.durMicro} ${ink.easeOut}`,
    outline: { default: null, ':focus-visible': `2px solid ${ink.focus}` },
    outlineOffset: 2
  },
  tagOn: { backgroundColor: ink.ink, color: ink.onInk },
  tagOut: {
    color: { default: ink.muted, [at.hover]: { ':hover': ink.ink } },
    backgroundColor: 'transparent',
    boxShadow: {
      default: `inset 0 0 0 1px ${ink.rule}`,
      [at.hover]: { ':hover': `inset 0 0 0 1px ${ink.ink}` }
    }
  },

  // Questions as rows.
  questions: {
    margin: 0,
    marginTop: 48,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: ink.ink
  },
  question: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 5fr) minmax(0, 7fr)', [at.stack]: 'minmax(0, 1fr)' },
    columnGap: 'clamp(32px, 6vw, 96px)',
    rowGap: 8,
    paddingBlock: 28,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: ink.rule
  },
  q: {
    margin: 0,
    fontFamily: ink.display,
    fontWeight: 700,
    fontSize: 20,
    lineHeight: 1.3,
    letterSpacing: '-0.01em'
  },
  a: { margin: 0, maxWidth: '52ch', color: ink.ink2 },

  // Close: the MCP address, on an ink band.
  close: {
    backgroundColor: ink.ink,
    color: ink.onInk
  },
  closeH2: { color: ink.onInk, maxWidth: '14ch' },
  closeBody: { color: ink.onInkMuted },
  closeSide: { display: 'grid', gap: 28, justifyItems: 'start', alignSelf: 'end' },
  code: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingBlock: 12,
    paddingInlineStart: 20,
    paddingInlineEnd: 12,
    borderRadius: ink.radiusCard,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: ink.inkRule,
    backgroundColor: ink.inkWell
  },
  codeText: {
    flexGrow: 1,
    whiteSpace: 'nowrap',
    userSelect: 'all',
    fontFamily: ink.mono,
    fontSize: { default: 17, [at.phone]: 14 },
    color: ink.onInk
  },
  copy: {
    flexShrink: 0,
    minHeight: 44,
    paddingInline: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: ink.inkRule,
    backgroundColor: { default: 'transparent', [at.hover]: { ':hover': ink.ink2 } },
    color: ink.onInk,
    fontFamily: ink.body,
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    transition: `background-color ${ink.durShort} ${ink.easeOut}`,
    outline: { default: null, ':focus-visible': `2px solid ${ink.accentOnInk}` },
    outlineOffset: 2
  },

  // Footer: a mast.
  footer: {
    paddingBlockStart: 'clamp(56px, 8vw, 112px)',
    paddingBlockEnd: 40
  },
  mast: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(12px, 2vw, 24px)',
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: ink.ink,
    fontFamily: ink.display,
    fontWeight: 700,
    fontSize: 'clamp(2.25rem, 7vw, 6rem)',
    lineHeight: 1,
    letterSpacing: ink.tracking
  },
  mastIcon: {
    width: '0.9em',
    height: '0.9em',
    flexShrink: 0
  },
  footerRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 20
  },
  footerLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginBlock: 0,
    marginInline: -12,
    padding: 0,
    listStyle: 'none'
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 44,
    paddingInline: 12,
    color: ink.ink,
    fontWeight: 600,
    textDecorationLine: 'underline',
    textDecorationThickness: 1,
    textUnderlineOffset: '0.2em',
    textDecorationColor: { default: ink.rule, [at.hover]: { ':hover': ink.accent } },
    transition: `text-decoration-color ${ink.durMicro} ${ink.easeOut}`,
    borderRadius: 6,
    outline: { default: null, ':focus-visible': `2px solid ${ink.focus}` },
    outlineOffset: 2
  },
  fine: { margin: 0, fontSize: 15, color: ink.muted }
});
