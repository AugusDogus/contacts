import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
const bob = stylex.keyframes({
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-5px)' }
});
export const styles = stylex.create({
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
    paddingBottom: 4
  },
  art: { position: 'relative', width: 72, height: 72 },
  logo: { display: 'block', width: 72, height: 72 },
  bob: {
    animationName: { default: bob, [media.reducedMotion]: 'none' },
    animationDuration: '1.6s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite'
  },
  badge: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 24,
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: tokens.paper,
    backgroundColor: '#2f8a57',
    color: tokens.paper
  },
  badgeWarn: { backgroundColor: '#c9962a' },
  track: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: tokens.hover,
    overflow: 'hidden'
  },
  bar: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: tokens.blue,
    transition: { default: `width 400ms ${tokens.easeOut}`, [media.reducedMotion]: 'none' }
  },
  barWarn: { backgroundColor: '#c9962a' },
  status: { fontSize: 14, color: tokens.muted, textAlign: 'center', textWrap: 'balance' },
  notice: { marginTop: 16 },
  failures: {
    listStyle: 'none',
    margin: 0,
    marginTop: 16,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxHeight: 'min(36dvh, 280px)',
    overflowY: 'auto'
  },
  failure: { display: 'flex', flexDirection: 'column', gap: 2, fontSize: 13 },
  name: { fontWeight: 600 },
  reason: { color: tokens.danger, textWrap: 'pretty', overflowWrap: 'anywhere' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }
});
