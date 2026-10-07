import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
const pop = stylex.keyframes({
  from: { opacity: 0, transform: 'translateY(8px) scale(.97)' },
  to: { opacity: 1, transform: 'none' }
});
const fade = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
export const styles = stylex.create({
  dialog: {
    borderWidth: 0,
    borderRadius: 14,
    padding: 0,
    width: 'min(460px, calc(100vw - 24px))',
    maxHeight: 'calc(100dvh - 48px)',
    color: tokens.ink,
    outline: 'none',
    boxShadow: '0 0 0 1px #1e23300f, 0 24px 64px #1e233033',
    animationName: { default: pop, [media.reducedMotion]: fade },
    animationDuration: '220ms',
    animationTimingFunction: tokens.easeOut,
    '::backdrop': {
      backgroundColor: '#1e233052',
      animationName: fade,
      animationDuration: '220ms',
      animationTimingFunction: tokens.easeOut
    }
  },
  wide: { width: 'min(640px, calc(100vw - 24px))' },
  large: { width: 'min(920px, calc(100vw - 24px))' },
  modalBody: { padding: { default: 24, [media.mobile]: 20 } },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: -4,
    marginRight: -8,
    marginBottom: 16
  },
  title: { fontSize: 19, margin: 0, overflowWrap: 'anywhere' }
});
