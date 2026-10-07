import * as stylex from '@stylexjs/stylex';
import { tokens, media } from '../tokens.stylex';
const rotate = stylex.keyframes({ to: { transform: 'rotate(360deg)' } });
export const styles = stylex.create({
  progress: { display: 'flex', flexDirection: 'column', gap: 8 },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: tokens.hover,
    overflow: 'hidden'
  },
  bar: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: tokens.blue,
    transition: { default: `width 300ms ${tokens.easeOut}`, [media.reducedMotion]: 'none' }
  },
  barWarn: { backgroundColor: '#c9962a' },
  counts: { fontSize: 13, color: tokens.muted },
  notice: { marginTop: 12 },
  list: {
    listStyle: 'none',
    margin: 0,
    marginTop: 16,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'min(50dvh, 420px)',
    overflowY: 'auto'
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    paddingBlock: 9,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: { default: tokens.line, ':last-child': 'transparent' }
  },
  body: { flexGrow: 1, minWidth: 0, paddingTop: 4 },
  line: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  name: {
    fontSize: 14,
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  state: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
    fontSize: 13,
    color: tokens.faint
  },
  stateWorking: { color: tokens.blue },
  stateDone: { color: '#2f6b47' },
  stateFailed: { color: tokens.danger },
  spin: {
    display: 'inline-flex',
    animationName: { default: rotate, [media.reducedMotion]: 'none' },
    animationDuration: '900ms',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite'
  },
  message: { marginTop: 4, fontSize: 13, color: tokens.muted, textWrap: 'pretty' },
  messageFailed: { color: tokens.danger },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }
});
